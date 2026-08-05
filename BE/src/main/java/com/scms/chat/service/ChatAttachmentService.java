package com.scms.chat.service;

import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.dto.response.ChatAttachmentResponse;
import com.scms.chat.entity.ChatMessageType;
import com.scms.common.exception.BadRequestException;
import com.scms.common.service.CloudinaryService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Xử lý upload tệp/ảnh đính kèm cho chat: kiểm tra hợp lệ rồi đẩy lên Cloudinary.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatAttachmentService {

    static final int MAX_FILE_NAME_LENGTH = 255;

    /**
     * Chỉ nhận URL Cloudinary để client không gắn được liên kết ngoài vào tin nhắn.
     */
    static final String CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

    /**
     * Các đuôi tệp bị chặn vì có thể thực thi được trên máy người nhận.
     */
    static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "com", "cpl", "dll", "jar", "js", "jse",
            "msi", "msc", "ps1", "reg", "scr", "sh", "vb", "vbe", "vbs", "wsf"
    );

    CloudinaryService cloudinaryService;
    ChatAccessService chatAccessService;
    GroupChatAccessService groupChatAccessService;
    String chatFolder;
    long maxAttachmentSize;

    public ChatAttachmentService(
            CloudinaryService cloudinaryService,
            ChatAccessService chatAccessService,
            GroupChatAccessService groupChatAccessService,
            @Value("${app.cloudinary-folder.chat:scms/chat}") String chatFolder,
            @Value("${app.chat.attachment.max-size:20971520}") long maxAttachmentSize
    ) {
        this.cloudinaryService = cloudinaryService;
        this.chatAccessService = chatAccessService;
        this.groupChatAccessService = groupChatAccessService;
        this.chatFolder = chatFolder;
        this.maxAttachmentSize = maxAttachmentSize;
    }

    /**
     * Upload tệp đính kèm sau khi đã xác thực người gửi thuộc phòng chat tương ứng.
     *
     * @param roomType "group" cho nhóm chat, các giá trị còn lại hiểu là phòng ban.
     */
    public ChatAttachmentResponse upload(
            String username,
            UUID roomId,
            String roomType,
            MultipartFile file
    ) {
        if ("group".equalsIgnoreCase(roomType)) {
            groupChatAccessService.requireMember(username, roomId);
        } else {
            chatAccessService.requireRoomAccess(username, roomId);
        }
        return upload(file);
    }

    private ChatAttachmentResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp đính kèm không được để trống.");
        }
        if (file.getSize() > maxAttachmentSize) {
            throw new BadRequestException(
                    "Tệp đính kèm không được vượt quá " + (maxAttachmentSize / (1024 * 1024)) + "MB."
            );
        }

        String fileName = normalizeFileName(file.getOriginalFilename());
        String extension = extractExtension(fileName);
        if (BLOCKED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Không hỗ trợ gửi tệp có định dạng ." + extension + ".");
        }

        String contentType = file.getContentType();
        boolean image = contentType != null
                && contentType.toLowerCase(Locale.ROOT).startsWith("image/");

        String url = cloudinaryService.uploadFile(file, chatFolder);

        return ChatAttachmentResponse.builder()
                .messageType(image ? ChatMessageType.IMAGE : ChatMessageType.FILE)
                .attachmentUrl(url)
                .attachmentName(fileName)
                .attachmentContentType(contentType)
                .attachmentSize(file.getSize())
                .build();
    }

    /**
     * Kiểm tra phần đính kèm client gửi kèm tin nhắn STOMP.
     * Chỉ chấp nhận URL do Cloudinary trả về để client không chèn được liên kết tuỳ ý.
     *
     * @return null nếu tin nhắn không có đính kèm.
     */
    public ChatAttachmentResponse resolveAttachment(SendChatMessageRequest request) {
        String url = request.getAttachmentUrl() == null
                ? ""
                : request.getAttachmentUrl().trim();
        if (url.isEmpty()) {
            return null;
        }
        if (!url.startsWith(CLOUDINARY_URL_PREFIX)) {
            throw new BadRequestException("Tệp đính kèm không hợp lệ.");
        }

        ChatMessageType messageType = request.getMessageType() == ChatMessageType.IMAGE
                ? ChatMessageType.IMAGE
                : ChatMessageType.FILE;
        String fileName = normalizeFileName(request.getAttachmentName());
        if (BLOCKED_EXTENSIONS.contains(extractExtension(fileName))) {
            throw new BadRequestException("Không hỗ trợ gửi tệp có định dạng này.");
        }
        Long size = request.getAttachmentSize();

        return ChatAttachmentResponse.builder()
                .messageType(messageType)
                .attachmentUrl(url)
                .attachmentName(fileName)
                .attachmentContentType(request.getAttachmentContentType())
                .attachmentSize(size != null && size > 0 ? size : null)
                .build();
    }

    /**
     * Bỏ thông tin thư mục để tránh path traversal và cắt bớt cho vừa cột lưu trữ.
     */
    private String normalizeFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "tep-dinh-kem";
        }
        String name = originalFilename
                .replace('\\', '/')
                .substring(originalFilename.replace('\\', '/').lastIndexOf('/') + 1)
                .trim();
        if (name.isEmpty()) {
            return "tep-dinh-kem";
        }
        return name.length() > MAX_FILE_NAME_LENGTH
                ? name.substring(name.length() - MAX_FILE_NAME_LENGTH)
                : name;
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
