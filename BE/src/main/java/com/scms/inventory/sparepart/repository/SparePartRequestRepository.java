package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePartRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SparePartRequestRepository extends JpaRepository<SparePartRequest, UUID> {

    boolean existsByReqNumber(String reqNumber);

    @Query("""
        SELECT DISTINCT r FROM SparePartRequest r
        LEFT JOIN FETCH r.createdBy u
        LEFT JOIN FETCH u.employee e
        LEFT JOIN FETCH r.workOrder w
        WHERE (:reqNumber IS NULL OR r.reqNumber LIKE %:reqNumber%)
          AND (:orderNumber IS NULL OR w.orderNumber LIKE %:orderNumber%)
          AND (:status IS NULL OR r.status = :status)
        ORDER BY r.createdAt DESC
    """)
    Page<SparePartRequest> findByFilters(
        @Param("reqNumber") String reqNumber,
        @Param("orderNumber") String orderNumber,
        @Param("status") String status,
        Pageable pageable
    );

    @Query("""
        SELECT r FROM SparePartRequest r
        LEFT JOIN FETCH r.createdBy u
        LEFT JOIN FETCH u.employee e
        LEFT JOIN FETCH r.workOrder w
        LEFT JOIN FETCH r.items items
        LEFT JOIN FETCH items.sparePart s
        WHERE r.reqId = :reqId
    """)
    Optional<SparePartRequest> findByIdWithDetails(UUID reqId);

    @Query("""
        SELECT r FROM SparePartRequest r
        WHERE r.createdBy.username = :username
          AND r.status IN ('issued', 'rejected')
          AND r.isRead = false
    """)
    java.util.List<SparePartRequest> findUnreadNotifications(@Param("username") String username);
}
