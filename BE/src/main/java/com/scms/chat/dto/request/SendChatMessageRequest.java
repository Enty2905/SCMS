package com.scms.chat.dto.request;

import com.scms.chat.entity.ChatMessageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendChatMessageRequest {

    @NotNull(message = "Mã tin nhắn phía client không được để trống")
    UUID clientMessageId;

    /**
     * Nội dung văn bản. Với tin nhắn đính kèm, đây là chú thích và được phép để trống.
     * Ràng buộc "phải có nội dung hoặc đính kèm" được kiểm tra ở tầng service.
     */
    @Size(max = 2000, message = "Nội dung tin nhắn không được vượt quá 2.000 ký tự")
    String content;

    /**
     * Bỏ trống sẽ được hiểu là {@link ChatMessageType#TEXT}.
     */
    ChatMessageType messageType;

    @Size(max = 500, message = "Đường dẫn tệp đính kèm không hợp lệ")
    String attachmentUrl;

    @Size(max = 255, message = "Tên tệp đính kèm không được vượt quá 255 ký tự")
    String attachmentName;

    @Size(max = 100, message = "Định dạng tệp đính kèm không hợp lệ")
    String attachmentContentType;

    Long attachmentSize;

    /**
     * Tiện dụng cho tin nhắn văn bản thuần.
     */
    public SendChatMessageRequest(UUID clientMessageId, String content) {
        this.clientMessageId = clientMessageId;
        this.content = content;
    }
}
