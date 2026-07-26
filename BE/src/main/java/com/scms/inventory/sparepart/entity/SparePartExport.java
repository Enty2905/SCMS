package com.scms.inventory.sparepart.entity;

import com.scms.auth.entity.User;
import com.scms.maintenance.workorder.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "spare_part_export")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartExport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "export_id")
    UUID exportId;

    @Column(name = "export_number", length = 50, nullable = false, unique = true)
    String exportNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "req_id")
    SparePartRequest sparePartRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exported_by")
    User exportedBy;

    @Column(name = "exported_at", nullable = false)
    LocalDateTime exportedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @OneToMany(mappedBy = "sparePartExport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<SparePartExportItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (exportedAt == null) {
            exportedAt = LocalDateTime.now();
        }
    }
}
