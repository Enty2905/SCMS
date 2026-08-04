package com.scms.chat.repository;

import com.scms.chat.entity.GroupChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {

    @EntityGraph(attributePaths = {"sender", "sender.employee", "sender.employee.position"})
    Optional<GroupChatMessage> findByMessageId(UUID messageId);

    @EntityGraph(attributePaths = {"sender", "sender.employee", "sender.employee.position"})
    Optional<GroupChatMessage> findBySenderUserIdAndClientMessageId(
            UUID senderUserId,
            UUID clientMessageId
    );

    @EntityGraph(attributePaths = {"sender", "sender.employee", "sender.employee.position"})
    Optional<GroupChatMessage> findFirstByRoomRoomIdOrderBySequenceDesc(UUID roomId);

    @EntityGraph(attributePaths = {"sender", "sender.employee", "sender.employee.position"})
    Slice<GroupChatMessage> findByRoomRoomIdOrderBySequenceDesc(
            UUID roomId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"sender", "sender.employee", "sender.employee.position"})
    Slice<GroupChatMessage> findByRoomRoomIdAndSequenceLessThanOrderBySequenceDesc(
            UUID roomId,
            Long sequence,
            Pageable pageable
    );

    long countByRoomRoomIdAndSequenceGreaterThanAndSenderUserIdNot(
            UUID roomId,
            Long sequence,
            UUID senderUserId
    );
}
