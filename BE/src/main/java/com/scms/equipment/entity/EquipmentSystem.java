package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "equipment_system")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE equipment_system SET is_deleted = true WHERE system_id = ?")
@SQLRestriction("is_deleted = false")
public class EquipmentSystem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "system_id")
    private UUID systemId;

    @Column(name = "system_name")
    private String systemName;

    @Column(name = "system_code")
    private String systemCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "parent_system_id")
    private UUID parentSystemId;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean is_deleted = false;
}
