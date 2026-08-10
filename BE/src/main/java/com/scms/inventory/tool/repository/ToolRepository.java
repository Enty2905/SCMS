package com.scms.inventory.tool.repository;

import com.scms.inventory.tool.entity.Tool;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ToolRepository extends JpaRepository<Tool, UUID> {

    Optional<Tool> findByToolIdAndIsDeletedFalse(UUID id);

    @Query("SELECT t FROM Tool t WHERE t.isDeleted = false AND t.totalQuantity > 0 AND " +
            "(:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:category IS NULL OR LOWER(t.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    Page<Tool> searchByKeywordAndCategory(
            @Param("keyword") String keyword,
            @Param("category") String category,
            Pageable pageable);

    /**
     * Tổng số lượng đang mượn của một tool (các bản ghi tool_borrow chưa trả).
     */
    @Query("SELECT COALESCE(SUM(tb.quantity), 0) FROM ToolBorrow tb " +
            "WHERE tb.toolId = :toolId AND tb.returnedAt IS NULL")
    int sumBorrowedQuantity(@Param("toolId") UUID toolId);

    /**
     * Lấy danh sách CCDC có damagedQuantity > 0 (có hư hỏng).
     */
    @Query("SELECT t FROM Tool t WHERE t.isDeleted = false AND t.damagedQuantity > 0 AND " +
            "(:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:category IS NULL OR LOWER(t.category) LIKE LOWER(CONCAT('%', :category, '%')))")
    Page<Tool> findDamagedTools(
            @Param("keyword") String keyword,
            @Param("category") String category,
            Pageable pageable);
}
