package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, UUID> {

    Optional<SparePart> findByCodeAndIsDeletedFalse(String code);

    Page<SparePart> findByIsDeletedFalse(Pageable pageable);

    Optional<SparePart> findBySparePartIdAndIsDeletedFalse(UUID id);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM SparePartRequest r JOIN r.items i WHERE i.sparePart.sparePartId = :id AND r.status = 'pending'")
    boolean existsBySparePartIdAndStatusPending(@Param("id") UUID id);

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false AND " +
            "(:code IS NULL OR LOWER(s.code) LIKE LOWER(CONCAT('%', :code, '%'))) AND " +
            "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<SparePart> searchByCodeAndName(@Param("code") String code, @Param("name") String name, Pageable pageable);

    @Query("SELECT MAX(s.code) FROM SparePart s WHERE s.code LIKE 'VTTT-%'")
    String findMaxCode();
}
