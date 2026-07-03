package com.scms.maintenance.workorder.entity;

import com.scms.auth.entity.User;
import com.scms.employee.entity.Employee;
import com.scms.maintenance.repairrequest.entity.RepairRequest;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "work_order")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_id")
    UUID orderId;

    // Số phiếu công tác – người dùng nhập thủ công, phải unique
    @Column(name = "order_number", length = 50, nullable = false, unique = true)
    String orderNumber;

    // Một repair_request có thể tạo nhiều PCT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    RepairRequest request;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    // draft | open | extended | locked
    @Column(name = "status", length = 20, nullable = false)
    String status;

    @Column(name = "start_date")
    LocalDateTime startDate;

    @Column(name = "end_date")
    LocalDateTime endDate;

    @Column(name = "extended_to")
    LocalDateTime extendedTo;

    // Người lãnh đạo công việc
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_leader_id")
    Employee workLeader;

    // Người chỉ huy trực tiếp
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direct_commander_id")
    Employee directCommander;

    // Người giám sát an toàn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "safety_supervisor_id")
    Employee safetySupervisor;

    // User tạo phiếu công tác
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    User createdBy;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    // Danh sách thành viên tham gia PCT
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    List<WorkOrderMember> members = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (status == null) status = "draft";
        createdAt = LocalDateTime.now();
    }
}
