package com.scms.chat.dto.response;

import com.scms.chat.entity.ChatMessageType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * Kết quả upload tệp đính kèm chat. FE dùng payload này để gửi kèm tin nhắn qua STOMP.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatAttachmentResponse {
    ChatMessageType messageType;
    String attachmentUrl;
    String attachmentName;
    String attachmentContentType;
    Long attachmentSize;
}
