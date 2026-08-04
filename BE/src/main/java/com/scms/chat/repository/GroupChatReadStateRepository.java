package com.scms.chat.repository;

import com.scms.chat.entity.GroupChatReadState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GroupChatReadStateRepository extends JpaRepository<GroupChatReadState, Long> {

    Optional<GroupChatReadState> findByRoomRoomIdAndUserUserId(UUID roomId, UUID userId);

    void deleteByRoomRoomIdAndUserUserId(UUID roomId, UUID userId);
}
