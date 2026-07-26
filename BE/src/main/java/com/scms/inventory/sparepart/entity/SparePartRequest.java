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
@Table(name = "spare_part_request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "req_id")
    UUID reqId;

    @Column(name = "req_number", length = 50, unique = true)
    String reqNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    WorkOrder workOrder;

    // pending | approved | issued | rejected
    @Column(name = "status", length = 20, nullable = false)
    String status;

    @Column(name = "pdf_url", length = 500)
    String pdfUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    User issuedBy;

    @Column(name = "issued_at")
    LocalDateTime issuedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @OneToMany(mappedBy = "sparePartRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<SparePartRequestItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "pending";
        }
    }
}
