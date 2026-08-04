package com.scms.chat.repository;

import com.scms.chat.entity.GroupChatRoom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupChatRoomRepository extends JpaRepository<GroupChatRoom, UUID> {

    @Override
    @EntityGraph(attributePaths = {"owner", "owner.employee"})
    Optional<GroupChatRoom> findById(UUID roomId);

    @EntityGraph(attributePaths = {"owner", "owner.employee"})
    @Query("""
        SELECT room
        FROM GroupChatRoom room
        JOIN GroupChatMember member ON member.room = room
        WHERE member.user.userId = :userId
        ORDER BY room.updatedAt DESC
    """)
    List<GroupChatRoom> findAllAccessibleByUserId(@Param("userId") UUID userId);
}
