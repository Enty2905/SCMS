package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.chat.dto.request.MarkChatReadRequest;
import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.dto.response.ChatHistoryResponse;
import com.scms.chat.dto.response.ChatMessageResponse;
import com.scms.chat.dto.response.ChatReadResponse;
import com.scms.chat.dto.response.ChatRoomResponse;
import com.scms.chat.entity.DepartmentChatMessage;
import com.scms.chat.entity.DepartmentChatReadState;
import com.scms.chat.repository.DepartmentChatMessageRepository;
import com.scms.chat.repository.DepartmentChatReadStateRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.NotFoundException;
import com.scms.department.entity.Department;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DepartmentChatService {

    static final int DEFAULT_HISTORY_SIZE = 30;
    static final int MAX_HISTORY_SIZE = 100;

    ChatAccessService chatAccessService;
    DepartmentChatMessageRepository messageRepository;
    DepartmentChatReadStateRepository readStateRepository;

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRooms(String username) {
        User user = chatAccessService.requireActiveUser(username);
        return chatAccessService.getAccessibleDepartments(user)
                .stream()
                .map(department -> toRoomResponse(department, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatHistoryResponse getMessages(
            String username,
            UUID departmentId,
            String cursor,
            int size
    ) {
        chatAccessService.requireRoomAccess(username, departmentId);
        int pageSize = normalizeSize(size);
        PageRequest pageRequest = PageRequest.of(0, pageSize);
        Slice<DepartmentChatMessage> slice;

        if (cursor == null || cursor.isBlank()) {
            slice = messageRepository.findByDepartmentDepartmentIdOrderBySequenceDesc(
                    departmentId,
                    pageRequest
            );
        } else {
            slice = messageRepository
                    .findByDepartmentDepartmentIdAndSequenceLessThanOrderBySequenceDesc(
                            departmentId,
                            decodeCursor(cursor),
                            pageRequest
                    );
        }

        List<DepartmentChatMessage> messages = new ArrayList<>(slice.getContent());
        Collections.reverse(messages);
        String nextCursor = slice.hasNext() && !messages.isEmpty()
                ? encodeCursor(messages.get(0).getSequence())
                : null;

        return ChatHistoryResponse.builder()
                .content(messages.stream().map(this::toMessageResponse).toList())
                .nextCursor(nextCursor)
                .hasMore(slice.hasNext())
                .build();
    }

    @Transactional
    public ChatMessageResponse sendMessage(
            String username,
            UUID departmentId,
            SendChatMessageRequest request
    ) {
        User sender = chatAccessService.requireRoomAccess(username, departmentId);
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isEmpty()) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống.");
        }
        if (content.length() > 2000) {
            throw new BadRequestException("Nội dung tin nhắn không được vượt quá 2.000 ký tự.");
        }

        return messageRepository
                .findBySenderUserIdAndClientMessageId(
                        sender.getUserId(),
                        request.getClientMessageId()
                )
                .map(this::toMessageResponse)
                .orElseGet(() -> {
                    DepartmentChatMessage message = DepartmentChatMessage.builder()
                            .department(sender.getEmployee().getDepartment())
                            .sender(sender)
                            .clientMessageId(request.getClientMessageId())
                            .content(content)
                            .build();

                    if (chatAccessService.isAdmin(sender)) {
                        Department department = chatAccessService
                                .getAccessibleDepartments(sender)
                                .stream()
                                .filter(item -> item.getDepartmentId().equals(departmentId))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Phòng chat không tồn tại."));
                        message.setDepartment(department);
                    }

                    return toMessageResponse(messageRepository.saveAndFlush(message));
                });
    }

    @Transactional
    public ChatReadResponse markAsRead(
            String username,
            UUID departmentId,
            MarkChatReadRequest request
    ) {
        User user = chatAccessService.requireRoomAccess(username, departmentId);
        DepartmentChatMessage message = messageRepository.findByMessageId(request.getLastMessageId())
                .filter(item -> item.getDepartment().getDepartmentId().equals(departmentId))
                .orElseThrow(() -> new NotFoundException("Tin nhắn không thuộc phòng chat này."));

        DepartmentChatReadState state = readStateRepository
                .findByDepartmentDepartmentIdAndUserUserId(departmentId, user.getUserId())
                .orElseGet(() -> DepartmentChatReadState.builder()
                        .department(message.getDepartment())
                        .user(user)
                        .lastReadSequence(0L)
                        .build());

        if (message.getSequence() > state.getLastReadSequence()) {
            state.setLastReadSequence(message.getSequence());
            readStateRepository.save(state);
        }

        return ChatReadResponse.builder()
                .departmentId(departmentId)
                .lastMessageId(message.getMessageId())
                .unreadCount(countUnread(departmentId, user))
                .build();
    }

    private ChatRoomResponse toRoomResponse(Department department, User user) {
        ChatMessageResponse lastMessage = messageRepository
                .findFirstByDepartmentDepartmentIdOrderBySequenceDesc(department.getDepartmentId())
                .map(this::toMessageResponse)
                .orElse(null);

        return ChatRoomResponse.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .lastMessage(lastMessage)
                .unreadCount(countUnread(department.getDepartmentId(), user))
                .build();
    }

    private long countUnread(UUID departmentId, User user) {
        long lastReadSequence = readStateRepository
                .findByDepartmentDepartmentIdAndUserUserId(departmentId, user.getUserId())
                .map(DepartmentChatReadState::getLastReadSequence)
                .orElse(0L);

        return messageRepository
                .countByDepartmentDepartmentIdAndSequenceGreaterThanAndSenderUserIdNot(
                        departmentId,
                        lastReadSequence,
                        user.getUserId()
                );
    }

    private ChatMessageResponse toMessageResponse(DepartmentChatMessage message) {
        var employee = message.getSender().getEmployee();
        return ChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .clientMessageId(message.getClientMessageId())
                .departmentId(message.getDepartment().getDepartmentId())
                .senderUserId(message.getSender().getUserId())
                .senderName(employee == null ? message.getSender().getUsername() : employee.getName())
                .senderAvatarUrl(employee == null ? null : employee.getAvatarUrl())
                .senderPosition(employee == null || employee.getPosition() == null
                        ? null
                        : employee.getPosition().getPositionName())
                .content(message.getContent())
                .sentAt(message.getCreatedAt())
                .build();
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return DEFAULT_HISTORY_SIZE;
        }
        return Math.min(size, MAX_HISTORY_SIZE);
    }

    private String encodeCursor(long sequence) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(Long.toString(sequence).getBytes(StandardCharsets.UTF_8));
    }

    private long decodeCursor(String cursor) {
        try {
            String decoded = new String(
                    Base64.getUrlDecoder().decode(cursor),
                    StandardCharsets.UTF_8
            );
            long sequence = Long.parseLong(decoded);
            if (sequence <= 0) {
                throw new NumberFormatException();
            }
            return sequence;
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Cursor lịch sử chat không hợp lệ.");
        }
    }
}
