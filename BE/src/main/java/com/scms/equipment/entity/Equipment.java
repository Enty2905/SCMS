package com.scms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE equipment SET is_deleted = true WHERE equipment_id = ?")
@SQLRestriction("is_deleted = false")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "equipment_id", columnDefinition = "BINARY(16)")
    private UUID id;

    // Mã định danh theo tiêu chuẩn KKS (NOT NULL trong DB)
    @Column(name = "kks_code", nullable = false, length = 100)
    private String kksCode;

    // Tên thiết bị — cột "name" trong DB (NOT NULL)
    @Column(name = "name", nullable = false, length = 200)
    private String equipmentName;

    // Loại thiết bị — cột "type" trong DB (NOT NULL)
    @Column(name = "type", nullable = false, length = 100)
    private String equipmentType;

    // Trạng thái: active | inactive | maintenance | broken
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // Vị trí lắp đặt trong nhà máy
    @Column(name = "location", length = 200)
    private String location;

    // Khóa ngoại tới equipment_system
    @Column(name = "system_id", columnDefinition = "BINARY(16)")
    private UUID systemId;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private Boolean is_deleted = false;
}
