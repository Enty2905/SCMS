package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.chat.entity.GroupChatRoom;
import com.scms.chat.repository.GroupChatMemberRepository;
import com.scms.chat.repository.GroupChatRoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GroupChatAccessService {

    ChatAccessService chatAccessService;
    GroupChatRoomRepository roomRepository;
    GroupChatMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public User requireMember(String username, UUID roomId) {
        User user = chatAccessService.requireActiveUser(username);
        requireRoom(roomId);
        if (!memberRepository.existsByRoomRoomIdAndUserUserId(roomId, user.getUserId())) {
            throw new AccessDeniedException("Bạn không phải thành viên của phòng chat này.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public User requireOwner(String username, UUID roomId) {
        User user = chatAccessService.requireActiveUser(username);
        GroupChatRoom room = requireRoom(roomId);
        if (!room.getOwner().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("Chỉ chủ phòng mới được quản lý thành viên.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public GroupChatRoom requireRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new AccessDeniedException("Phòng chat không tồn tại."));
    }
}
