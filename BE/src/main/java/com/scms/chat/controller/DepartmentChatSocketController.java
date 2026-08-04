package com.scms.chat.controller;

import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.dto.response.ChatMessageResponse;
import com.scms.chat.dto.response.ChatSocketErrorResponse;
import com.scms.chat.service.DepartmentChatService;
import com.scms.chat.service.GroupChatService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DepartmentChatSocketController {

    DepartmentChatService chatService;
    GroupChatService groupChatService;
    SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/rooms/{departmentId}/messages")
    public void sendMessage(
            Principal principal,
            @DestinationVariable UUID departmentId,
            @Valid @Payload SendChatMessageRequest request
    ) {
        ChatMessageResponse response = chatService.sendMessage(
                principal.getName(),
                departmentId,
                request
        );
        messagingTemplate.convertAndSend("/topic/chat/rooms/" + departmentId, response);
    }

    @MessageMapping("/chat/groups/{roomId}/messages")
    public void sendGroupMessage(
            Principal principal,
            @DestinationVariable UUID roomId,
            @Valid @Payload SendChatMessageRequest request
    ) {
        ChatMessageResponse response = groupChatService.sendMessage(
                principal.getName(),
                roomId,
                request
        );
        groupChatService.getActiveMemberUsernames(roomId).forEach(username ->
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/queue/chat/group-messages",
                        response
                )
        );
    }

    @MessageExceptionHandler
    @SendToUser(value = "/queue/chat/errors", broadcast = false)
    public ChatSocketErrorResponse handleChatException(Exception exception) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            message = "Không thể xử lý tin nhắn.";
        }
        return ChatSocketErrorResponse.builder()
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
