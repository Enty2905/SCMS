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
public class GroupChatRoomResponse {
    UUID roomId;
    String roomType;
    String roomName;
    UUID ownerUserId;
    String ownerName;
    long memberCount;
    ChatMessageResponse lastMessage;
    long unreadCount;
    LocalDateTime createdAt;
}
