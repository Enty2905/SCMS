package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "equipment_id")
    UUID equipmentId;

    // Mã định danh theo tiêu chuẩn KKS
    @Column(name = "kks_code", length = 100, nullable = false, unique = true)
    String kksCode;

    @Column(name = "name", length = 200, nullable = false)
    String name;

    // Cơ khí | Điện | CI
    @Column(name = "type", length = 100, nullable = false)
    String type;

    // active | inactive | maintenance | broken
    @Column(name = "status", length = 20, nullable = false)
    String status;

    // Vị trí lắp đặt trong nhà máy
    @Column(name = "location", length = 200)
    String location;
}
