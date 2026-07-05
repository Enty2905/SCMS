package com.scms.maintenance.workorder.repository;

import com.scms.maintenance.workorder.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID> {

    boolean existsByOrderNumber(String orderNumber);

    /**
     * Lấy WorkOrder kèm toàn bộ quan hệ để tránh N+1 khi build response
     */
    @Query("""
        SELECT DISTINCT wo FROM WorkOrder wo
        LEFT JOIN FETCH wo.request r
        LEFT JOIN FETCH r.equipment
        LEFT JOIN FETCH wo.workLeader
        LEFT JOIN FETCH wo.directCommander
        LEFT JOIN FETCH wo.safetySupervisor
        LEFT JOIN FETCH wo.createdBy u
        LEFT JOIN FETCH u.employee
        WHERE wo.orderId = :orderId
    """)
    Optional<WorkOrder> findByIdWithDetails(@Param("orderId") UUID orderId);
}
