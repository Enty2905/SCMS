package com.scms.maintenance.repairrequest.repository;

import com.scms.maintenance.repairrequest.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, UUID> {

    /**
     * Lấy tất cả request có status = 'pending', kèm equipment và createdBy
     * để tránh N+1 query
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
}
