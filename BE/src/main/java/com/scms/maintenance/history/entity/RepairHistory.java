package com.scms.maintenance.history.entity;

import com.scms.auth.entity.User;
import com.scms.equipment.entity.Equipment;
import com.scms.maintenance.workorder.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "repair_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "history_id")
    UUID historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    WorkOrder workOrder;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "repaired_at", nullable = false)
    LocalDateTime repairedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repaired_by")
    User repairedBy;

    @PrePersist
    protected void onCreate() {
        if (this.repairedAt == null) {
            this.repairedAt = LocalDateTime.now();
        }
    }
}
