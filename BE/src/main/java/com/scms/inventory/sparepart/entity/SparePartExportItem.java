package com.scms.inventory.sparepart.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Bảng chi tiết phụ tùng xuất kho trong phiếu xuất (spare_part_export_item).
 */
@Entity
@Table(name = "spare_part_export_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartExportItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_id", nullable = false)
    SparePartExport sparePartExport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    SparePart sparePart;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;
}
