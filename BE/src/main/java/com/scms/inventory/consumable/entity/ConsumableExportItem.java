package com.scms.inventory.consumable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Bảng chi tiết vật tư xuất kho trong phiếu xuất (consumable_export_item).
 */
@Entity
@Table(name = "consumable_export_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableExportItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_id", nullable = false)
    ConsumableExport consumableExport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_id", nullable = false)
    Consumable consumable;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;
}
