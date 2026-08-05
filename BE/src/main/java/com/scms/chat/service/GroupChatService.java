package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.chat.dto.request.AddGroupChatMembersRequest;
import com.scms.chat.dto.request.CreateGroupChatRoomRequest;
import com.scms.chat.dto.request.MarkChatReadRequest;
import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.dto.response.ChatAttachmentResponse;
import com.scms.chat.dto.response.ChatHistoryResponse;
import com.scms.chat.dto.response.ChatMessageResponse;
import com.scms.chat.dto.response.ChatReadResponse;
import com.scms.chat.dto.response.ChatUserResponse;
import com.scms.chat.dto.response.GroupChatRoomDetailResponse;
import com.scms.chat.dto.response.GroupChatRoomResponse;
import com.scms.chat.entity.ChatMessageType;
import com.scms.chat.entity.GroupChatMember;
import com.scms.chat.entity.GroupChatMessage;
import com.scms.chat.entity.GroupChatReadState;
import com.scms.chat.entity.GroupChatRoom;
import com.scms.chat.repository.GroupChatMemberRepository;
import com.scms.chat.repository.GroupChatMessageRepository;
import com.scms.chat.repository.GroupChatReadStateRepository;
import com.scms.chat.repository.GroupChatRoomRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.NotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GroupChatService {

    static final int DEFAULT_HISTORY_SIZE = 30;
    static final int MAX_HISTORY_SIZE = 100;
    static final int MAX_USER_SEARCH_SIZE = 100;

    ChatAccessService chatAccessService;
    ChatAttachmentService chatAttachmentService;
    GroupChatAccessService groupAccessService;
    UserRepository userRepository;
    GroupChatRoomRepository roomRepository;
    GroupChatMemberRepository memberRepository;
    GroupChatMessageRepository messageRepository;
    GroupChatReadStateRepository readStateRepository;

    @Transactional(readOnly = true)
    public List<GroupChatRoomResponse> getRooms(String username) {
        User user = chatAccessService.requireActiveUser(username);
        return roomRepository.findAllAccessibleByUserId(user.getUserId())
                .stream()
                .map(room -> toRoomResponse(room, user))
                .toList();
    }

    @Transactional
    public GroupMemberChangeResult createRoom(
            String username,
            CreateGroupChatRoomRequest request
    ) {
        User owner = chatAccessService.requireActiveUser(username);
        GroupChatRoom room = roomRepository.save(
                GroupChatRoom.builder()
                        .roomName(normalizeRoomName(request.getRoomName()))
                        .owner(owner)
                        .build()
        );

        List<User> invitedUsers = resolveActiveUsers(
                request.getMemberUserIds(),
                owner.getUserId()
        );
        List<GroupChatMember> members = new ArrayList<>();
        members.add(newMember(room, owner, owner));
        invitedUsers.forEach(user -> members.add(newMember(room, user, owner)));
        memberRepository.saveAll(members);

        List<String> affectedUsernames = members.stream()
                .map(member -> member.getUser().getUsername())
                .toList();
        return new GroupMemberChangeResult(
                toRoomDetail(room, owner),
                affectedUsernames
        );
    }

    @Transactional(readOnly = true)
    public GroupChatRoomDetailResponse getRoomDetail(String username, UUID roomId) {
        User user = groupAccessService.requireMember(username, roomId);
        return toRoomDetail(groupAccessService.requireRoom(roomId), user);
    }

    @Transactional
    public GroupMemberChangeResult addMembers(
            String username,
            UUID roomId,
            AddGroupChatMembersRequest request
    ) {
        User owner = groupAccessService.requireOwner(username, roomId);
        GroupChatRoom room = groupAccessService.requireRoom(roomId);
        List<User> users = resolveActiveUsers(request.getMemberUserIds(), owner.getUserId());
        List<GroupChatMember> addedMembers = users.stream()
                .filter(user -> !memberRepository.existsByRoomRoomIdAndUserUserId(
                        roomId,
                        user.getUserId()
                ))
                .map(user -> newMember(room, user, owner))
                .toList();

        memberRepository.saveAll(addedMembers);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);

        return new GroupMemberChangeResult(
                toRoomDetail(room, owner),
                addedMembers.stream()
                        .map(member -> member.getUser().getUsername())
                        .toList()
        );
    }

    @Transactional
    public RemovedGroupMemberResult removeMember(
            String username,
            UUID roomId,
            UUID memberUserId
    ) {
        User owner = groupAccessService.requireOwner(username, roomId);
        GroupChatRoom room = groupAccessService.requireRoom(roomId);
        if (room.getOwner().getUserId().equals(memberUserId)) {
            throw new BadRequestException("Không thể xóa chủ phòng khỏi nhóm.");
        }

        GroupChatMember membership = memberRepository
                .findByRoomRoomIdAndUserUserId(roomId, memberUserId)
                .orElseThrow(() -> new NotFoundException("Thành viên không có trong phòng chat."));
        String removedUsername = membership.getUser().getUsername();

        readStateRepository.deleteByRoomRoomIdAndUserUserId(roomId, memberUserId);
        memberRepository.delete(membership);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);

        return new RemovedGroupMemberResult(
                toRoomDetail(room, owner),
                removedUsername
        );
    }

    @Transactional(readOnly = true)
    public List<ChatUserResponse> searchUsers(
            String username,
            String search,
            int size
    ) {
        User currentUser = chatAccessService.requireActiveUser(username);
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        int pageSize = Math.min(Math.max(size, 1), MAX_USER_SEARCH_SIZE);

        return userRepository
                .findActiveChatUsers(normalizedSearch, PageRequest.of(0, pageSize))
                .stream()
                .filter(user -> !user.getUserId().equals(currentUser.getUserId()))
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatHistoryResponse getMessages(
            String username,
            UUID roomId,
            String cursor,
            int size
    ) {
        groupAccessService.requireMember(username, roomId);
        int pageSize = normalizeSize(size);
        PageRequest pageRequest = PageRequest.of(0, pageSize);
        Slice<GroupChatMessage> slice;

        if (cursor == null || cursor.isBlank()) {
            slice = messageRepository.findByRoomRoomIdOrderBySequenceDesc(
                    roomId,
                    pageRequest
            );
        } else {
            slice = messageRepository
                    .findByRoomRoomIdAndSequenceLessThanOrderBySequenceDesc(
                            roomId,
                            decodeCursor(cursor),
                            pageRequest
                    );
        }

        List<GroupChatMessage> messages = new ArrayList<>(slice.getContent());
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
            UUID roomId,
            SendChatMessageRequest request
    ) {
        User sender = groupAccessService.requireMember(username, roomId);
        String content = request.getContent() == null ? "" : request.getContent().trim();
        ChatAttachmentResponse attachment = chatAttachmentService.resolveAttachment(request);
        if (content.isEmpty() && attachment == null) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống.");
        }
        if (content.length() > 2000) {
            throw new BadRequestException("Nội dung tin nhắn không được vượt quá 2.000 ký tự.");
        }

        var existingMessage = messageRepository.findBySenderUserIdAndClientMessageId(
                sender.getUserId(),
                request.getClientMessageId()
        );
        if (existingMessage.isPresent()) {
            GroupChatMessage message = existingMessage.get();
            if (!message.getRoom().getRoomId().equals(roomId)) {
                throw new BadRequestException(
                        "Mã tin nhắn đã được sử dụng trong một phòng chat khác."
                );
            }
            return toMessageResponse(message);
        }

        GroupChatRoom room = groupAccessService.requireRoom(roomId);
        GroupChatMessage message = GroupChatMessage.builder()
                .room(room)
                .sender(sender)
                .clientMessageId(request.getClientMessageId())
                .content(content)
                .messageType(attachment == null
                        ? ChatMessageType.TEXT
                        : attachment.getMessageType())
                .attachmentUrl(attachment == null ? null : attachment.getAttachmentUrl())
                .attachmentName(attachment == null ? null : attachment.getAttachmentName())
                .attachmentContentType(attachment == null
                        ? null
                        : attachment.getAttachmentContentType())
                .attachmentSize(attachment == null ? null : attachment.getAttachmentSize())
                .build();
        ChatMessageResponse response = toMessageResponse(
                messageRepository.saveAndFlush(message)
        );
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
        return response;
    }

    @Transactional
    public ChatReadResponse markAsRead(
            String username,
            UUID roomId,
            MarkChatReadRequest request
    ) {
        User user = groupAccessService.requireMember(username, roomId);
        GroupChatMessage message = messageRepository.findByMessageId(request.getLastMessageId())
                .filter(item -> item.getRoom().getRoomId().equals(roomId))
                .orElseThrow(() -> new NotFoundException(
                        "Tin nhắn không thuộc phòng chat này."
                ));

        GroupChatReadState state = readStateRepository
                .findByRoomRoomIdAndUserUserId(roomId, user.getUserId())
                .orElseGet(() -> GroupChatReadState.builder()
                        .room(message.getRoom())
                        .user(user)
                        .lastReadSequence(0L)
                        .build());

        if (message.getSequence() > state.getLastReadSequence()) {
            state.setLastReadSequence(message.getSequence());
            readStateRepository.save(state);
        }

        return ChatReadResponse.builder()
                .roomId(roomId)
                .roomType("group")
                .lastMessageId(message.getMessageId())
                .unreadCount(countUnread(roomId, user))
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getActiveMemberUsernames(UUID roomId) {
        return memberRepository.findActiveUsernamesByRoomId(roomId);
    }

    private GroupChatRoomResponse toRoomResponse(GroupChatRoom room, User user) {
        ChatMessageResponse lastMessage = messageRepository
                .findFirstByRoomRoomIdOrderBySequenceDesc(room.getRoomId())
                .map(this::toMessageResponse)
                .orElse(null);

        return GroupChatRoomResponse.builder()
                .roomId(room.getRoomId())
                .roomType("group")
                .roomName(room.getRoomName())
                .ownerUserId(room.getOwner().getUserId())
                .ownerName(displayName(room.getOwner()))
                .memberCount(memberRepository.countByRoomRoomId(room.getRoomId()))
                .lastMessage(lastMessage)
                .unreadCount(countUnread(room.getRoomId(), user))
                .createdAt(room.getCreatedAt())
                .build();
    }

    private GroupChatRoomDetailResponse toRoomDetail(GroupChatRoom room, User requester) {
        List<ChatUserResponse> members = memberRepository
                .findByRoomRoomIdOrderByJoinedAtAsc(room.getRoomId())
                .stream()
                .map(GroupChatMember::getUser)
                .map(this::toUserResponse)
                .toList();

        return GroupChatRoomDetailResponse.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .ownerUserId(room.getOwner().getUserId())
                .owner(room.getOwner().getUserId().equals(requester.getUserId()))
                .members(members)
                .build();
    }

    private ChatMessageResponse toMessageResponse(GroupChatMessage message) {
        return ChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .clientMessageId(message.getClientMessageId())
                .roomId(message.getRoom().getRoomId())
                .roomType("group")
                .senderUserId(message.getSender().getUserId())
                .senderName(displayName(message.getSender()))
                .senderAvatarUrl(message.getSender().getEmployee() == null
                        ? null
                        : message.getSender().getEmployee().getAvatarUrl())
                .senderPosition(
                        message.getSender().getEmployee() == null
                                || message.getSender().getEmployee().getPosition() == null
                                ? null
                                : message.getSender()
                                        .getEmployee()
                                        .getPosition()
                                        .getPositionName()
                )
                .content(message.getContent())
                .messageType(message.getMessageType())
                .attachmentUrl(message.getAttachmentUrl())
                .attachmentName(message.getAttachmentName())
                .attachmentContentType(message.getAttachmentContentType())
                .attachmentSize(message.getAttachmentSize())
                .sentAt(message.getCreatedAt())
                .build();
    }

    private ChatUserResponse toUserResponse(User user) {
        var employee = user.getEmployee();
        return ChatUserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .employeeName(employee == null ? user.getUsername() : employee.getName())
                .avatarUrl(employee == null ? null : employee.getAvatarUrl())
                .departmentName(
                        employee == null || employee.getDepartment() == null
                                ? null
                                : employee.getDepartment().getDepartmentName()
                )
                .positionName(
                        employee == null || employee.getPosition() == null
                                ? null
                                : employee.getPosition().getPositionName()
                )
                .build();
    }

    private List<User> resolveActiveUsers(List<UUID> requestedIds, UUID excludedUserId) {
        if (requestedIds == null || requestedIds.isEmpty()) {
            return List.of();
        }

        Set<UUID> uniqueIds = new LinkedHashSet<>(requestedIds);
        uniqueIds.remove(excludedUserId);
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<User> users = userRepository.findAllActiveChatUsersByIds(
                new ArrayList<>(uniqueIds)
        );
        if (users.size() != uniqueIds.size()) {
            throw new BadRequestException(
                    "Danh sách có tài khoản không tồn tại, đã khóa hoặc đã xóa."
            );
        }
        return users;
    }

    private GroupChatMember newMember(GroupChatRoom room, User user, User addedBy) {
        return GroupChatMember.builder()
                .room(room)
                .user(user)
                .addedBy(addedBy)
                .build();
    }

    private long countUnread(UUID roomId, User user) {
        long lastReadSequence = readStateRepository
                .findByRoomRoomIdAndUserUserId(roomId, user.getUserId())
                .map(GroupChatReadState::getLastReadSequence)
                .orElse(0L);

        return messageRepository.countByRoomRoomIdAndSequenceGreaterThanAndSenderUserIdNot(
                roomId,
                lastReadSequence,
                user.getUserId()
        );
    }

    private String displayName(User user) {
        return user.getEmployee() == null ? user.getUsername() : user.getEmployee().getName();
    }

    private String normalizeRoomName(String roomName) {
        String normalized = roomName == null ? "" : roomName.trim();
        if (normalized.length() < 2 || normalized.length() > 150) {
            throw new BadRequestException("Tên phòng chat phải có từ 2 đến 150 ký tự.");
        }
        return normalized;
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

    public record GroupMemberChangeResult(
            GroupChatRoomDetailResponse room,
            List<String> affectedUsernames
    ) {
    }

    public record RemovedGroupMemberResult(
            GroupChatRoomDetailResponse room,
            String removedUsername
    ) {
    }
}
