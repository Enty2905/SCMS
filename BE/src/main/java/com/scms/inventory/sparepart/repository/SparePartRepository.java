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

    Optional<SparePart> findByCode(String code);

    @Query("SELECT s FROM SparePart s WHERE " +
            "LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SparePart> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
