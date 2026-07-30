package com.scms.common.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id")
    UUID logId;

    @Column(name = "user_id")
    UUID userId;

    @Column(name = "action", length = 100, nullable = false)
    String action;

    @Column(name = "table_name", length = 100)
    String tableName;

    @Column(name = "record_id", length = 100)
    String recordId;

    @Column(name = "detail", columnDefinition = "TEXT")
    String detail;

    @Column(name = "ip_address", length = 50)
    String ipAddress;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "created_by", length = 100)
    String createdBy;
}
