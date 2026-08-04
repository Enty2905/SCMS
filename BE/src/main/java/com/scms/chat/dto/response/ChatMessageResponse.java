package com.scms.chat.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    UUID messageId;
    UUID clientMessageId;
    UUID roomId;
    String roomType;
    UUID departmentId;
    UUID senderUserId;
    String senderName;
    String senderAvatarUrl;
    String senderPosition;
    String content;
    LocalDateTime sentAt;
}
