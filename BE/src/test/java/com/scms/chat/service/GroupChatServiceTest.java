package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.chat.dto.request.CreateGroupChatRoomRequest;
import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.dto.response.ChatMessageResponse;
import com.scms.chat.entity.GroupChatMember;
import com.scms.chat.entity.GroupChatMessage;
import com.scms.chat.entity.GroupChatRoom;
import com.scms.chat.repository.GroupChatMemberRepository;
import com.scms.chat.repository.GroupChatMessageRepository;
import com.scms.chat.repository.GroupChatReadStateRepository;
import com.scms.chat.repository.GroupChatRoomRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.employee.entity.Employee;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupChatServiceTest {

    @Mock
    ChatAccessService chatAccessService;

    @Mock
    ChatAttachmentService chatAttachmentService;

    @Mock
    GroupChatAccessService groupAccessService;

    @Mock
    UserRepository userRepository;

    @Mock
    GroupChatRoomRepository roomRepository;

    @Mock
    GroupChatMemberRepository memberRepository;

    @Mock
    GroupChatMessageRepository messageRepository;

    @Mock
    GroupChatReadStateRepository readStateRepository;

    @InjectMocks
    GroupChatService service;

    @Test
    void creatorBecomesOwnerAndSelectedUsersBecomeMembers() {
        User owner = user("owner");
        User invited = user("invited");
        CreateGroupChatRoomRequest request = new CreateGroupChatRoomRequest(
                "  Nhóm Sprint 5  ",
                List.of(invited.getUserId())
        );
        when(chatAccessService.requireActiveUser("owner")).thenReturn(owner);
        when(roomRepository.save(any(GroupChatRoom.class))).thenAnswer(invocation -> {
            GroupChatRoom room = invocation.getArgument(0);
            room.setRoomId(UUID.randomUUID());
            room.setCreatedAt(LocalDateTime.now());
            return room;
        });
        when(userRepository.findAllActiveChatUsersByIds(List.of(invited.getUserId())))
                .thenReturn(List.of(invited));

        GroupChatService.GroupMemberChangeResult result = service.createRoom(
                "owner",
                request
        );

        ArgumentCaptor<List<GroupChatMember>> membersCaptor = ArgumentCaptor.forClass(
                List.class
        );
        verify(memberRepository).saveAll(membersCaptor.capture());
        assertThat(membersCaptor.getValue()).hasSize(2);
        assertThat(membersCaptor.getValue().get(0).getUser()).isSameAs(owner);
        assertThat(result.room().getRoomName()).isEqualTo("Nhóm Sprint 5");
        assertThat(result.affectedUsernames()).containsExactly("owner", "invited");
    }

    @Test
    void ownerCannotBeRemovedFromRoom() {
        User owner = user("owner");
        GroupChatRoom room = room(owner);
        when(groupAccessService.requireOwner("owner", room.getRoomId())).thenReturn(owner);
        when(groupAccessService.requireRoom(room.getRoomId())).thenReturn(room);

        assertThatThrownBy(() ->
                service.removeMember("owner", room.getRoomId(), owner.getUserId())
        )
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("chủ phòng");
    }

    @Test
    void groupMessageIsTrimmedAndTaggedWithGroupRoom() {
        User sender = user("sender");
        GroupChatRoom room = room(user("owner"));
        UUID clientMessageId = UUID.randomUUID();
        when(groupAccessService.requireMember("sender", room.getRoomId()))
                .thenReturn(sender);
        when(messageRepository.findBySenderUserIdAndClientMessageId(
                sender.getUserId(),
                clientMessageId
        )).thenReturn(Optional.empty());
        when(groupAccessService.requireRoom(room.getRoomId())).thenReturn(room);
        when(messageRepository.saveAndFlush(any(GroupChatMessage.class)))
                .thenAnswer(invocation -> {
                    GroupChatMessage message = invocation.getArgument(0);
                    message.setMessageId(UUID.randomUUID());
                    message.setSequence(1L);
                    message.setCreatedAt(LocalDateTime.now());
                    return message;
                });

        ChatMessageResponse response = service.sendMessage(
                "sender",
                room.getRoomId(),
                new SendChatMessageRequest(clientMessageId, "  Xin chào nhóm  ")
        );

        assertThat(response.getRoomId()).isEqualTo(room.getRoomId());
        assertThat(response.getRoomType()).isEqualTo("group");
        assertThat(response.getContent()).isEqualTo("Xin chào nhóm");
    }

    @Test
    void clientMessageIdCannotBeReusedInAnotherRoom() {
        User sender = user("sender");
        GroupChatRoom requestedRoom = room(user("owner"));
        GroupChatRoom existingRoom = room(user("another-owner"));
        UUID clientMessageId = UUID.randomUUID();
        GroupChatMessage existingMessage = GroupChatMessage.builder()
                .room(existingRoom)
                .sender(sender)
                .clientMessageId(clientMessageId)
                .content("Tin nhắn cũ")
                .build();

        when(groupAccessService.requireMember("sender", requestedRoom.getRoomId()))
                .thenReturn(sender);
        when(messageRepository.findBySenderUserIdAndClientMessageId(
                sender.getUserId(),
                clientMessageId
        )).thenReturn(Optional.of(existingMessage));

        assertThatThrownBy(() -> service.sendMessage(
                "sender",
                requestedRoom.getRoomId(),
                new SendChatMessageRequest(clientMessageId, "Tin nhắn mới")
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("phòng chat khác");

        verify(messageRepository, never()).saveAndFlush(any());
    }

    private static GroupChatRoom room(User owner) {
        return GroupChatRoom.builder()
                .roomId(UUID.randomUUID())
                .roomName("Nhóm kiểm thử")
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
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
