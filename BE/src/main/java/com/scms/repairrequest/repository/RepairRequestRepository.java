package com.scms.repairrequest.repository;

import com.scms.repairrequest.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, UUID> {

    /**
     * Lấy tất cả request theo status (processing | done)
     * kèm equipment và createdBy để tránh N+1 query
     */
    @Query("""
        SELECT DISTINCT r FROM RepairRequest r
        LEFT JOIN FETCH r.equipment
        LEFT JOIN FETCH r.createdBy u
        LEFT JOIN FETCH u.employee e
        WHERE r.status = :status
        ORDER BY r.createdAt DESC
    """)
    List<RepairRequest> findByStatusWithDetails(String status);

    /**
     * Lấy tất cả request do một user tạo ra (cho Trưởng Ca xem lại lịch sử)
     */
    @Query("""
        SELECT DISTINCT r FROM RepairRequest r
        LEFT JOIN FETCH r.equipment
        LEFT JOIN FETCH r.createdBy u
        LEFT JOIN FETCH u.employee e
        WHERE r.createdBy.userId = :userId
        ORDER BY r.createdAt DESC
    """)
    List<RepairRequest> findByCreatedByUserIdWithDetails(UUID userId);

    /**
     * Lấy tất cả request với bộ lọc status tùy chọn (null = lấy tất cả)
     */
    @Query("""
        SELECT DISTINCT r FROM RepairRequest r
        LEFT JOIN FETCH r.equipment
        LEFT JOIN FETCH r.createdBy u
        LEFT JOIN FETCH u.employee e
        WHERE (:status IS NULL OR r.status = :status)
        ORDER BY r.createdAt DESC
    """)
    List<RepairRequest> findAllWithDetailsAndStatus(String status);
}
