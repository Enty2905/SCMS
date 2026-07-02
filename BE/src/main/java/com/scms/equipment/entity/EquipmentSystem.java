package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "equipment_system")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
