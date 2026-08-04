package com.scms.chat.repository;

import com.scms.chat.entity.GroupChatMember;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupChatMemberRepository extends JpaRepository<GroupChatMember, Long> {

    boolean existsByRoomRoomIdAndUserUserId(UUID roomId, UUID userId);

    Optional<GroupChatMember> findByRoomRoomIdAndUserUserId(UUID roomId, UUID userId);

    @EntityGraph(attributePaths = {
            "user",
            "user.employee",
            "user.employee.department",
            "user.employee.position"
    })
    List<GroupChatMember> findByRoomRoomIdOrderByJoinedAtAsc(UUID roomId);

    long countByRoomRoomId(UUID roomId);

    @Query("""
        SELECT member.user.username
        FROM GroupChatMember member
        WHERE member.room.roomId = :roomId
          AND member.user.deleted = false
          AND member.user.isActive = true
    """)
    List<String> findActiveUsernamesByRoomId(@Param("roomId") UUID roomId);
}
