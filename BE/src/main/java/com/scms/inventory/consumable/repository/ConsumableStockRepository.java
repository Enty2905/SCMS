package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.Consumable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for consumable stock queries.
 * Tồn kho = SUM(import) - SUM(export), không dùng bảng stock.
 */
@Repository
public interface ConsumableStockRepository extends JpaRepository<Consumable, UUID> {

    /**
     * Tổng số lượng đã nhập của một vật tư.
     */
    @Query("SELECT COALESCE(SUM(ii.quantity), 0) FROM ConsumableImportItem ii WHERE ii.consumable.consumableId = :id")
    Long sumImported(@Param("id") UUID id);

    /**
     * Tổng số lượng đã xuất của một vật tư (native query vì chưa có entity ConsumableExportItem).
     */
    @Query(value = "SELECT COALESCE(SUM(ei.quantity), 0) FROM consumable_export_item ei WHERE ei.consumable_id = UUID_TO_BIN(:id)", nativeQuery = true)
    Long sumExported(@Param("id") String id);

    /**
     * Tìm kiếm vật tư theo code hoặc name (không phân biệt hoa thường), có phân trang.
     */
    @Query("SELECT c FROM Consumable c WHERE " +
            "(:keyword IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Consumable> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
