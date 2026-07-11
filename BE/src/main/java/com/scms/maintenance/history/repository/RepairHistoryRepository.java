package com.scms.maintenance.history.repository;

import com.scms.maintenance.history.entity.RepairHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepairHistoryRepository extends JpaRepository<RepairHistory, UUID> {

    @Query("""
        SELECT r FROM RepairHistory r
        LEFT JOIN FETCH r.equipment e
        LEFT JOIN FETCH r.workOrder w
        LEFT JOIN FETCH r.repairedBy u
        LEFT JOIN FETCH u.employee emp
        WHERE (:equipmentId IS NULL OR r.equipment.id = :equipmentId)
          AND (:kksCode IS NULL OR LOWER(e.kksCode) LIKE LOWER(CONCAT('%', :kksCode, '%')))
          AND (:equipmentName IS NULL OR LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :equipmentName, '%')))
          AND (:orderNumber IS NULL OR LOWER(w.orderNumber) LIKE LOWER(CONCAT('%', :orderNumber, '%')))
        ORDER BY r.repairedAt DESC
    """)
    Page<RepairHistory> findByFilters(
        @Param("equipmentId") UUID equipmentId,
        @Param("kksCode") String kksCode,
        @Param("equipmentName") String equipmentName,
        @Param("orderNumber") String orderNumber,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM RepairHistory r
        LEFT JOIN FETCH r.equipment e
        LEFT JOIN FETCH r.workOrder w
        LEFT JOIN FETCH r.repairedBy u
        LEFT JOIN FETCH u.employee emp
        WHERE r.historyId = :historyId
    """)
    Optional<RepairHistory> findByIdWithDetails(UUID historyId);
}
