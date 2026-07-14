package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SparePartStockRepository extends JpaRepository<SparePart, UUID> {

    @Query("SELECT COALESCE(SUM(ii.quantity), 0) FROM SparePartImportItem ii WHERE ii.sparePart.sparePartId = :id")
    Long sumImported(@Param("id") UUID id);

    @Query(value = "SELECT COALESCE(SUM(ei.quantity), 0) FROM spare_part_export_item ei WHERE ei.spare_part_id = UUID_TO_BIN(:id)", nativeQuery = true)
    Long sumExported(@Param("id") String id);

    @Query(value = "SELECT c.* FROM spare_part c " +
            "LEFT JOIN (SELECT spare_part_id, SUM(quantity) as total_in FROM spare_part_import_item GROUP BY spare_part_id) i ON c.spare_part_id = i.spare_part_id " +
            "LEFT JOIN (SELECT spare_part_id, SUM(quantity) as total_out FROM spare_part_export_item GROUP BY spare_part_id) e ON c.spare_part_id = e.spare_part_id " +
            "WHERE c.is_deleted = 0 " +
            "AND (COALESCE(:code, '') = '' OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) " +
            "AND (COALESCE(:name, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (COALESCE(i.total_in, 0) - COALESCE(e.total_out, 0)) > 0",
           countQuery = "SELECT COUNT(*) FROM spare_part c " +
            "LEFT JOIN (SELECT spare_part_id, SUM(quantity) as total_in FROM spare_part_import_item GROUP BY spare_part_id) i ON c.spare_part_id = i.spare_part_id " +
            "LEFT JOIN (SELECT spare_part_id, SUM(quantity) as total_out FROM spare_part_export_item GROUP BY spare_part_id) e ON c.spare_part_id = e.spare_part_id " +
            "WHERE c.is_deleted = 0 " +
            "AND (COALESCE(:code, '') = '' OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) " +
            "AND (COALESCE(:name, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (COALESCE(i.total_in, 0) - COALESCE(e.total_out, 0)) > 0",
           nativeQuery = true)
    Page<SparePart> searchByCodeAndName(@Param("code") String code, @Param("name") String name, Pageable pageable);
}
