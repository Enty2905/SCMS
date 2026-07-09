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
     * Tìm kiếm vật tư theo code và name (không phân biệt hoa thường), có phân trang.
     */
    @Query(value = "SELECT c.* FROM consumable c " +
            "LEFT JOIN (SELECT consumable_id, SUM(quantity) as total_in FROM consumable_import_item GROUP BY consumable_id) i ON c.consumable_id = i.consumable_id " +
            "LEFT JOIN (SELECT consumable_id, SUM(quantity) as total_out FROM consumable_export_item GROUP BY consumable_id) e ON c.consumable_id = e.consumable_id " +
            "WHERE c.is_deleted = 0 AND (COALESCE(i.total_in, 0) - COALESCE(e.total_out, 0)) > 0 " +
            "AND (COALESCE(:code, '') = '' OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) " +
            "AND (COALESCE(:name, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))",
           countQuery = "SELECT COUNT(*) FROM consumable c " +
            "LEFT JOIN (SELECT consumable_id, SUM(quantity) as total_in FROM consumable_import_item GROUP BY consumable_id) i ON c.consumable_id = i.consumable_id " +
            "LEFT JOIN (SELECT consumable_id, SUM(quantity) as total_out FROM consumable_export_item GROUP BY consumable_id) e ON c.consumable_id = e.consumable_id " +
            "WHERE c.is_deleted = 0 AND (COALESCE(i.total_in, 0) - COALESCE(e.total_out, 0)) > 0 " +
            "AND (COALESCE(:code, '') = '' OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) " +
            "AND (COALESCE(:name, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))",
           nativeQuery = true)
    Page<Consumable> searchByCodeAndName(@Param("code") String code, @Param("name") String name, Pageable pageable);
}
