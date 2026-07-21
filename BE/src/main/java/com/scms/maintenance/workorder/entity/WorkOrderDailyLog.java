package com.scms.maintenance.workorder.entity;

import com.scms.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_order_daily_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkOrderDailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id")
    UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    WorkOrder workOrder;

    // Ngày làm việc
    @Column(name = "date", nullable = false)
    LocalDate date;

    // User mở phiếu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opened_by", nullable = false)
    User openedBy;

    @Column(name = "opened_at", nullable = false)
    LocalDateTime openedAt;

    // User đóng phiếu - null nếu chưa đóng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by")
    User closedBy;

    @Column(name = "closed_at")
    LocalDateTime closedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;
}
