package com.scms.maintenance.workorder.repository;

import com.scms.maintenance.workorder.entity.WorkOrderMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderMemberRepository extends JpaRepository<WorkOrderMember, UUID> {

    /**
     * Lấy danh sách thành viên của một PCT, kèm thông tin employee
     */
    @Query("""
        SELECT m FROM WorkOrderMember m
        LEFT JOIN FETCH m.employee e
        LEFT JOIN FETCH e.position
        WHERE m.order.orderId = :orderId
        ORDER BY m.addedAt ASC
    """)
    List<WorkOrderMember> findByOrderIdWithEmployee(@Param("orderId") UUID orderId);
}
