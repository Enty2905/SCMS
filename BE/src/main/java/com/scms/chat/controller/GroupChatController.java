package com.scms.chat.controller;

import com.scms.chat.dto.request.AddGroupChatMembersRequest;
import com.scms.chat.dto.request.CreateGroupChatRoomRequest;
import com.scms.chat.dto.request.MarkChatReadRequest;
import com.scms.chat.dto.response.ChatHistoryResponse;
import com.scms.chat.dto.response.ChatReadResponse;
import com.scms.chat.dto.response.ChatUserResponse;
import com.scms.chat.dto.response.GroupChatEventResponse;
import com.scms.chat.dto.response.GroupChatRoomDetailResponse;
import com.scms.chat.dto.response.GroupChatRoomResponse;
import com.scms.chat.service.GroupChatService;
import com.scms.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
public class GroupChatController {

    static final String GROUP_EVENT_QUEUE = "/queue/chat/group-events";

    GroupChatService groupChatService;
    SimpMessagingTemplate messagingTemplate;

    @GetMapping("/groups")
    public ApiResponse<List<GroupChatRoomResponse>> getRooms(Principal principal) {
        return ApiResponse.success(
                "Đã tải danh sách phòng chat nhóm.",
                groupChatService.getRooms(principal.getName())
        );
    }

    @PostMapping("/groups")
    public ApiResponse<GroupChatRoomDetailResponse> createRoom(
            Principal principal,
            @Valid @RequestBody CreateGroupChatRoomRequest request
    ) {
        GroupChatService.GroupMemberChangeResult result = groupChatService.createRoom(
                principal.getName(),
                request
        );
        notifyUsers(result.affectedUsernames(), "ROOM_ADDED", result.room().getRoomId());
        return ApiResponse.created("Đã tạo phòng chat.", result.room());
    }

    @GetMapping("/groups/{roomId}")
    public ApiResponse<GroupChatRoomDetailResponse> getRoomDetail(
            Principal principal,
            @PathVariable UUID roomId
    ) {
        return ApiResponse.success(
                groupChatService.getRoomDetail(principal.getName(), roomId)
        );
    }

    @PostMapping("/groups/{roomId}/members")
    public ApiResponse<GroupChatRoomDetailResponse> addMembers(
            Principal principal,
            @PathVariable UUID roomId,
            @Valid @RequestBody AddGroupChatMembersRequest request
    ) {
        GroupChatService.GroupMemberChangeResult result = groupChatService.addMembers(
                principal.getName(),
                roomId,
                request
        );
        notifyUsers(result.affectedUsernames(), "ROOM_ADDED", roomId);
        return ApiResponse.success("Đã thêm thành viên.", result.room());
    }

    @DeleteMapping("/groups/{roomId}/members/{userId}")
    public ApiResponse<GroupChatRoomDetailResponse> removeMember(
            Principal principal,
            @PathVariable UUID roomId,
            @PathVariable UUID userId
    ) {
        GroupChatService.RemovedGroupMemberResult result = groupChatService.removeMember(
                principal.getName(),
                roomId,
                userId
        );
        notifyUsers(List.of(result.removedUsername()), "ROOM_REMOVED", roomId);
        return ApiResponse.success("Đã xóa thành viên khỏi phòng.", result.room());
    }

    @GetMapping("/groups/{roomId}/messages")
    public ApiResponse<ChatHistoryResponse> getMessages(
            Principal principal,
            @PathVariable UUID roomId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.success(
                groupChatService.getMessages(
                        principal.getName(),
                        roomId,
                        cursor,
                        size
                )
        );
    }

    @PutMapping("/groups/{roomId}/read")
    public ApiResponse<ChatReadResponse> markAsRead(
            Principal principal,
            @PathVariable UUID roomId,
            @Valid @RequestBody MarkChatReadRequest request
    ) {
        return ApiResponse.success(
                groupChatService.markAsRead(principal.getName(), roomId, request)
        );
    }

    @GetMapping("/users")
    public ApiResponse<List<ChatUserResponse>> searchUsers(
            Principal principal,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.success(
                groupChatService.searchUsers(principal.getName(), search, size)
        );
    }

    private void notifyUsers(List<String> usernames, String type, UUID roomId) {
        GroupChatEventResponse event = GroupChatEventResponse.builder()
                .type(type)
                .roomId(roomId)
                .build();
        usernames.forEach(username ->
                messagingTemplate.convertAndSendToUser(
                        username,
                        GROUP_EVENT_QUEUE,
                        event
                )
        );
    }
}
