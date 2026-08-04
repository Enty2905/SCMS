package com.scms.chat.config;

import com.scms.auth.service.AuthenticationService;
import com.scms.chat.service.ChatAccessService;
import com.scms.chat.service.GroupChatAccessService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatStompChannelInterceptorTest {

    @Mock
    AuthenticationService authenticationService;

    @Mock
    ChatAccessService chatAccessService;

    @Mock
    GroupChatAccessService groupChatAccessService;

    @InjectMocks
    ChatStompChannelInterceptor interceptor;

    @Test
    void connectWithoutBearerTokenIsRejected() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);

        assertThatThrownBy(() -> interceptor.preSend(message(accessor), null))
                .isInstanceOf(MessageDeliveryException.class)
                .hasMessageContaining("token");
    }

    @Test
    void authenticatedConnectStoresPrincipalOnTheOriginalMessage() throws Exception {
        SignedJWT jwt = org.mockito.Mockito.mock(SignedJWT.class);
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject("hr")
                .claim("scope", "ROLE_HR")
                .build();
        when(authenticationService.verifyToken("valid-token", false)).thenReturn(jwt);
        when(jwt.getJWTClaimsSet()).thenReturn(claims);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer valid-token");
        Message<byte[]> connectMessage = message(accessor);

        interceptor.preSend(connectMessage, null);

        StompHeaderAccessor storedAccessor = MessageHeaderAccessor.getAccessor(
                connectMessage,
                StompHeaderAccessor.class
        );
        assertThat(storedAccessor).isNotNull();
        assertThat(storedAccessor.getUser()).isNotNull();
        assertThat(storedAccessor.getUser().getName()).isEqualTo("hr");
        verify(chatAccessService).requireActiveUser("hr");
    }

    @Test
    void chatSubscriptionChecksDepartmentAccess() {
        UUID departmentId = UUID.randomUUID();
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/chat/rooms/" + departmentId);
        accessor.setUser(new UsernamePasswordAuthenticationToken("hr", null));

        interceptor.preSend(message(accessor), null);

        verify(chatAccessService).requireRoomAccess("hr", departmentId);
    }

    @Test
    void groupMessageSendChecksMembership() {
        UUID roomId = UUID.randomUUID();
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/app/chat/groups/" + roomId + "/messages");
        accessor.setUser(new UsernamePasswordAuthenticationToken("member", null));

        interceptor.preSend(message(accessor), null);

        verify(groupChatAccessService).requireMember("member", roomId);
    }

    private static Message<byte[]> message(StompHeaderAccessor accessor) {
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
