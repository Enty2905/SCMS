package com.scms.maintenance.repairrequest.entity;

import com.scms.auth.entity.User;
import com.scms.equipment.entity.Equipment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "repair_request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id")
    UUID requestId;

    // Một request chỉ gắn với một thiết bị
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    Equipment equipment;

    // User tạo request (Trưởng Ca / Trưởng Kíp)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    User createdBy;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    String description;

    // low | medium | high | critical
    @Column(name = "priority", length = 20, nullable = false)
    String priority;

    // pending | confirmed | in_progress | done | cancelled
    @Column(name = "status", length = 20, nullable = false)
    String status;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (status == null) status = "pending";
        if (priority == null) priority = "medium";
        createdAt = LocalDateTime.now();
    }
}
