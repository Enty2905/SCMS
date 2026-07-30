package com.scms.common.repository;

import com.scms.common.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    boolean existsByActionAndTableNameAndRecordIdAndCreatedAtBetween(
            String action,
            String tableName,
            String recordId,
            LocalDateTime start,
            LocalDateTime end
    );
}
