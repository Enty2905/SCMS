package com.scms.maintenance.assessment.entity;

import com.scms.employee.entity.Employee;
import com.scms.equipment.entity.Equipment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "technical_assessment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicalAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assessment_id")
    UUID assessmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    Equipment equipment;

    @Column(name = "damage_description", columnDefinition = "TEXT")
    String damageDescription;

    @Column(name = "proposed_action", columnDefinition = "TEXT")
    String proposedAction;

    // Nhân viên bên sửa chữa ký
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_signed_by")
    Employee repairSignedBy;

    @Column(name = "repair_signed_at")
    LocalDateTime repairSignedAt;

    // Nhân viên bên vận hành ký
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_signed_by")
    Employee operationSignedBy;

    @Column(name = "operation_signed_at")
    LocalDateTime operationSignedAt;

    // URL file PDF đã ký – null nếu chưa upload
    @Column(name = "pdf_url", length = 500)
    String pdfUrl;

    // Employee tạo biên bản (không phải User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    Employee createdBy;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
