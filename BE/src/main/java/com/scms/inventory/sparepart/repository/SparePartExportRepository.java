package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePartExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SparePartExportRepository extends JpaRepository<SparePartExport, UUID> {
    boolean existsByExportNumber(String exportNumber);
}
