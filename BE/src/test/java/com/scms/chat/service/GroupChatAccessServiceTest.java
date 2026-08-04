package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.chat.entity.GroupChatRoom;
import com.scms.chat.repository.GroupChatMemberRepository;
import com.scms.chat.repository.GroupChatRoomRepository;
import com.scms.employee.entity.Employee;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupChatAccessServiceTest {

    @Mock
    ChatAccessService chatAccessService;

    @Mock
    GroupChatRoomRepository roomRepository;

    @Mock
    GroupChatMemberRepository memberRepository;

    @InjectMocks
    GroupChatAccessService service;

    @Test
    void memberCanAccessGroupRoom() {
        User member = user("member");
        GroupChatRoom room = room(user("owner"));
        when(chatAccessService.requireActiveUser("member")).thenReturn(member);
        when(roomRepository.findById(room.getRoomId())).thenReturn(Optional.of(room));
        when(memberRepository.existsByRoomRoomIdAndUserUserId(
                room.getRoomId(),
                member.getUserId()
        )).thenReturn(true);

        assertThat(service.requireMember("member", room.getRoomId())).isSameAs(member);
    }

    @Test
    void nonMemberCannotAccessGroupRoom() {
        User outsider = user("outsider");
        GroupChatRoom room = room(user("owner"));
        when(chatAccessService.requireActiveUser("outsider")).thenReturn(outsider);
        when(roomRepository.findById(room.getRoomId())).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> service.requireMember("outsider", room.getRoomId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("thành viên");
    }

    @Test
    void onlyRoomOwnerCanManageMembers() {
        User owner = user("owner");
        User member = user("member");
        GroupChatRoom room = room(owner);
        when(roomRepository.findById(room.getRoomId())).thenReturn(Optional.of(room));
        when(chatAccessService.requireActiveUser("owner")).thenReturn(owner);
        when(chatAccessService.requireActiveUser("member")).thenReturn(member);

        assertThat(service.requireOwner("owner", room.getRoomId())).isSameAs(owner);
        assertThatThrownBy(() -> service.requireOwner("member", room.getRoomId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("chủ phòng");
    }

    private static GroupChatRoom room(User owner) {
        return GroupChatRoom.builder()
                .roomId(UUID.randomUUID())
                .roomName("Nhóm kiểm thử")
                .owner(owner)
                .build();
    }

    private static User user(String username) {
        Employee employee = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name(username)
                .build();
        return User.builder()
                .userId(UUID.randomUUID())
                .username(username)
                .employee(employee)
                .isActive(true)
                .deleted(false)
                .build();
    }
}
