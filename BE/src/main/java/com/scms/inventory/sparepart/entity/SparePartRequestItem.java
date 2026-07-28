package com.scms.inventory.sparepart.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "spare_part_request_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "req_id", nullable = false)
    SparePartRequest sparePartRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    SparePart sparePart;

    @Column(name = "quantity_requested", nullable = false)
    Integer quantityRequested;

    @Column(name = "quantity_issued", nullable = false)
    Integer quantityIssued;

    @PrePersist
    protected void onCreate() {
        if (this.quantityIssued == null) {
            this.quantityIssued = 0;
        }
    }
}
