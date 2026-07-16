package com.scms.maintenance.workorder.repository;

import com.scms.maintenance.workorder.entity.WorkOrderDailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkOrderDailyLogRepository extends JpaRepository<WorkOrderDailyLog, UUID> {
    
    // Lấy danh sách nhật ký của một phiếu công tác, sắp xếp theo ngày
    List<WorkOrderDailyLog> findByWorkOrderOrderIdOrderByDateAsc(UUID orderId);

    // Tìm phiên làm việc trong ngày của một phiếu công tác
    Optional<WorkOrderDailyLog> findByWorkOrderOrderIdAndDate(UUID orderId, LocalDate date);

    // Kiểm tra xem phiếu công tác có phiên nào đang mở không (chưa đóng)
    @Query("SELECT l FROM WorkOrderDailyLog l WHERE l.workOrder.orderId = :orderId AND l.closedAt IS NULL")
    Optional<WorkOrderDailyLog> findActiveLogByOrderId(@Param("orderId") UUID orderId);
}
