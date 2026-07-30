package com.scms.chat.controller;

import com.scms.chat.dto.request.MarkChatReadRequest;
import com.scms.chat.dto.response.ChatHistoryResponse;
import com.scms.chat.dto.response.ChatReadResponse;
import com.scms.chat.dto.response.ChatRoomResponse;
import com.scms.chat.service.DepartmentChatService;
import com.scms.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DepartmentChatController {

    DepartmentChatService chatService;

    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomResponse>> getRooms(Principal principal) {
        return ApiResponse.success(
                "Đã tải danh sách phòng chat.",
                chatService.getRooms(principal.getName())
        );
    }

    @GetMapping("/rooms/{departmentId}/messages")
    public ApiResponse<ChatHistoryResponse> getMessages(
            Principal principal,
            @PathVariable UUID departmentId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.success(
                "Đã tải lịch sử chat.",
                chatService.getMessages(principal.getName(), departmentId, cursor, size)
        );
    }

    @PutMapping("/rooms/{departmentId}/read")
    public ApiResponse<ChatReadResponse> markAsRead(
            Principal principal,
            @PathVariable UUID departmentId,
            @Valid @RequestBody MarkChatReadRequest request
    ) {
        return ApiResponse.success(
                "Đã cập nhật trạng thái đọc.",
                chatService.markAsRead(principal.getName(), departmentId, request)
        );
    }
}
