package com.scms.inventory.tool.borrow.repository;

import com.scms.inventory.tool.entity.ToolBorrow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ToolBorrowRepository extends JpaRepository<ToolBorrow, UUID> {

    /**
     * Tìm kiếm phiếu mượn theo tên CCDC hoặc tên nhân viên (join với employee).
     * Lọc theo status nếu không null.
     */
    @Query(value = """
        SELECT tb.* FROM tool_borrow tb
        JOIN tool t ON t.tool_id = tb.tool_id
        JOIN employee e ON e.employee_id = tb.borrowed_by
        WHERE (:status IS NULL OR tb.status = :status)
          AND (
            :keyword IS NULL
            OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY tb.borrowed_at DESC
    """,
    countQuery = """
        SELECT COUNT(*) FROM tool_borrow tb
        JOIN tool t ON t.tool_id = tb.tool_id
        JOIN employee e ON e.employee_id = tb.borrowed_by
        WHERE (:status IS NULL OR tb.status = :status)
          AND (
            :keyword IS NULL
            OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
    """,
    nativeQuery = true)
    Page<ToolBorrow> searchBorrows(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);

    /**
     * Tìm các phiếu mượn có status = 'borrowing' và dueDate < now (cho scheduler cập nhật overdue).
     */
    @Query("SELECT tb FROM ToolBorrow tb WHERE tb.status = 'borrowing' AND tb.dueDate < :now")
    List<ToolBorrow> findOverdueBorrows(@Param("now") LocalDateTime now);

    /**
     * Bulk update status sang 'overdue' cho tất cả phiếu quá hạn.
     */
    @Modifying
    @Query("UPDATE ToolBorrow tb SET tb.status = 'overdue' WHERE tb.status = 'borrowing' AND tb.dueDate < :now")
    int markOverdue(@Param("now") LocalDateTime now);
}
