package com.scms.chat.repository;

import com.scms.chat.entity.DepartmentChatReadState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DepartmentChatReadStateRepository
        extends JpaRepository<DepartmentChatReadState, Long> {

    Optional<DepartmentChatReadState> findByDepartmentDepartmentIdAndUserUserId(
            UUID departmentId,
            UUID userId
    );
}
