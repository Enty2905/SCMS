package com.scms.chat.config;

import com.nimbusds.jwt.SignedJWT;
import com.scms.auth.service.AuthenticationService;
import com.scms.chat.service.ChatAccessService;
import com.scms.chat.service.GroupChatAccessService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatStompChannelInterceptor implements ChannelInterceptor {

    static final String CHAT_TOPIC_PREFIX = "/topic/chat/rooms/";
    static final String CHAT_SEND_PREFIX = "/app/chat/rooms/";
    static final String GROUP_CHAT_SEND_PREFIX = "/app/chat/groups/";
    static final String CHAT_SEND_SUFFIX = "/messages";

    AuthenticationService authenticationService;
    ChatAccessService chatAccessService;
    GroupChatAccessService groupChatAccessService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message,
                StompHeaderAccessor.class
        );
        if (accessor == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            authenticate(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            authorizeSubscription(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            authorizeSend(accessor);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new MessageDeliveryException("Thiếu access token cho kết nối chat.");
        }

        try {
            SignedJWT jwt = authenticationService.verifyToken(
                    authorization.substring(7),
                    false
            );
            String username = jwt.getJWTClaimsSet().getSubject();
            String scope = jwt.getJWTClaimsSet().getStringClaim("scope");
            chatAccessService.requireActiveUser(username);

            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    AuthorityUtils.commaSeparatedStringToAuthorityList(
                            scope == null ? "" : scope.replace(" ", ",")
                    )
            ));
        } catch (Exception exception) {
            throw new MessageDeliveryException("Access token chat không hợp lệ.");
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(CHAT_TOPIC_PREFIX)) {
            return;
        }
        UUID departmentId = parseRoomId(destination.substring(CHAT_TOPIC_PREFIX.length()));
        chatAccessService.requireRoomAccess(requireUsername(accessor), departmentId);
    }

    private void authorizeSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.endsWith(CHAT_SEND_SUFFIX)) {
            return;
        }

        if (destination.startsWith(CHAT_SEND_PREFIX)) {
            String rawDepartmentId = destination.substring(
                    CHAT_SEND_PREFIX.length(),
                    destination.length() - CHAT_SEND_SUFFIX.length()
            );
            chatAccessService.requireRoomAccess(
                    requireUsername(accessor),
                    parseRoomId(rawDepartmentId)
            );
        } else if (destination.startsWith(GROUP_CHAT_SEND_PREFIX)) {
            String rawRoomId = destination.substring(
                    GROUP_CHAT_SEND_PREFIX.length(),
                    destination.length() - CHAT_SEND_SUFFIX.length()
            );
            groupChatAccessService.requireMember(
                    requireUsername(accessor),
                    parseRoomId(rawRoomId)
            );
        }
    }

    private String requireUsername(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new MessageDeliveryException("Kết nối WebSocket chưa được xác thực.");
        }
        return accessor.getUser().getName();
    }

    private UUID parseRoomId(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new MessageDeliveryException("Mã phòng chat không hợp lệ.");
        }
    }
}
