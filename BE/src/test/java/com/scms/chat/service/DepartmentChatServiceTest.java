package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.chat.dto.request.MarkChatReadRequest;
import com.scms.chat.dto.request.SendChatMessageRequest;
import com.scms.chat.entity.DepartmentChatMessage;
import com.scms.chat.entity.DepartmentChatReadState;
import com.scms.chat.repository.DepartmentChatMessageRepository;
import com.scms.chat.repository.DepartmentChatReadStateRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.department.entity.Department;
import com.scms.employee.entity.Employee;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartmentChatServiceTest {

    @Mock
    ChatAccessService chatAccessService;

    @Mock
    ChatAttachmentService chatAttachmentService;

    @Mock
    DepartmentChatMessageRepository messageRepository;

    @Mock
    DepartmentChatReadStateRepository readStateRepository;

    @InjectMocks
    DepartmentChatService service;

    @Test
    void sendMessageTrimsContentAndPersistsOnce() {
        Department department = department();
        User sender = user(department);
        UUID clientMessageId = UUID.randomUUID();
        SendChatMessageRequest request = new SendChatMessageRequest(
                clientMessageId,
                "  Nội dung công việc  "
        );
        when(chatAccessService.requireRoomAccess("hr", department.getDepartmentId()))
                .thenReturn(sender);
        when(messageRepository.findBySenderUserIdAndClientMessageId(
                sender.getUserId(),
                clientMessageId
        )).thenReturn(Optional.empty());
        when(chatAccessService.isAdmin(sender)).thenReturn(false);
        when(messageRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            DepartmentChatMessage message = invocation.getArgument(0);
            message.setSequence(1L);
            message.setMessageId(UUID.randomUUID());
            message.setCreatedAt(LocalDateTime.now());
            return message;
        });

        var response = service.sendMessage("hr", department.getDepartmentId(), request);

        ArgumentCaptor<DepartmentChatMessage> message =
                ArgumentCaptor.forClass(DepartmentChatMessage.class);
        verify(messageRepository).saveAndFlush(message.capture());
        assertThat(message.getValue().getContent()).isEqualTo("Nội dung công việc");
        assertThat(response.getContent()).isEqualTo("Nội dung công việc");
        assertThat(response.getClientMessageId()).isEqualTo(clientMessageId);
    }

    @Test
    void duplicateClientMessageReturnsExistingMessage() {
        Department department = department();
        User sender = user(department);
        DepartmentChatMessage existing = message(7L, department, sender, "Đã lưu");
        UUID clientMessageId = existing.getClientMessageId();
        when(chatAccessService.requireRoomAccess("hr", department.getDepartmentId()))
                .thenReturn(sender);
        when(messageRepository.findBySenderUserIdAndClientMessageId(
                sender.getUserId(),
                clientMessageId
        )).thenReturn(Optional.of(existing));

        var response = service.sendMessage(
                "hr",
                department.getDepartmentId(),
                new SendChatMessageRequest(clientMessageId, "Đã lưu")
        );

        assertThat(response.getMessageId()).isEqualTo(existing.getMessageId());
        verify(messageRepository, never()).saveAndFlush(any());
    }

    @Test
    void blankMessageIsRejected() {
        Department department = department();
        when(chatAccessService.requireRoomAccess("hr", department.getDepartmentId()))
                .thenReturn(user(department));

        assertThatThrownBy(() -> service.sendMessage(
                "hr",
                department.getDepartmentId(),
                new SendChatMessageRequest(UUID.randomUUID(), "   ")
        )).isInstanceOf(BadRequestException.class);
    }

    @Test
    void historyIsReturnedInChronologicalOrderWithCursor() {
        Department department = department();
        User sender = user(department);
        DepartmentChatMessage older = message(9L, department, sender, "Cũ");
        DepartmentChatMessage newer = message(10L, department, sender, "Mới");
        PageRequest pageRequest = PageRequest.of(0, 2);
        when(messageRepository.findByDepartmentDepartmentIdOrderBySequenceDesc(
                eq(department.getDepartmentId()),
                any(PageRequest.class)
        )).thenReturn(new SliceImpl<>(List.of(newer, older), pageRequest, true));

        var history = service.getMessages(
                "hr",
                department.getDepartmentId(),
                null,
                2
        );

        assertThat(history.getContent())
                .extracting(item -> item.getContent())
                .containsExactly("Cũ", "Mới");
        assertThat(history.isHasMore()).isTrue();
        assertThat(history.getNextCursor()).isNotBlank();
    }

    @Test
    void markReadNeverMovesCursorBackwards() {
        Department department = department();
        User reader = user(department);
        DepartmentChatMessage message = message(8L, department, reader, "Đã đọc");
        DepartmentChatReadState state = DepartmentChatReadState.builder()
                .department(department)
                .user(reader)
                .lastReadSequence(10L)
                .build();
        when(chatAccessService.requireRoomAccess("hr", department.getDepartmentId()))
                .thenReturn(reader);
        when(messageRepository.findByMessageId(message.getMessageId()))
                .thenReturn(Optional.of(message));
        when(readStateRepository.findByDepartmentDepartmentIdAndUserUserId(
                department.getDepartmentId(),
                reader.getUserId()
        )).thenReturn(Optional.of(state));
        when(messageRepository
                .countByDepartmentDepartmentIdAndSequenceGreaterThanAndSenderUserIdNot(
                        department.getDepartmentId(),
                        10L,
                        reader.getUserId()
                )).thenReturn(0L);

        service.markAsRead(
                "hr",
                department.getDepartmentId(),
                new MarkChatReadRequest(message.getMessageId())
        );

        assertThat(state.getLastReadSequence()).isEqualTo(10L);
        verify(readStateRepository, never()).save(any());
    }

    private static Department department() {
        return Department.builder()
                .departmentId(UUID.randomUUID())
                .departmentCode("NS")
                .departmentName("Nhân sự")
                .build();
    }

    private static User user(Department department) {
        Employee employee = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name("Nguyễn Văn A")
                .department(department)
                .build();
        return User.builder()
                .userId(UUID.randomUUID())
                .username("hr")
                .employee(employee)
                .isActive(true)
                .deleted(false)
                .build();
    }

    private static DepartmentChatMessage message(
            long sequence,
            Department department,
            User sender,
            String content
    ) {
        return DepartmentChatMessage.builder()
                .sequence(sequence)
                .messageId(UUID.randomUUID())
                .clientMessageId(UUID.randomUUID())
                .department(department)
                .sender(sender)
                .content(content)
                .createdAt(LocalDateTime.now().plusSeconds(sequence))
                .build();
    }
}
