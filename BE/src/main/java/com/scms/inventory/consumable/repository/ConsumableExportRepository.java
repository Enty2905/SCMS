package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.ConsumableExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConsumableExportRepository extends JpaRepository<ConsumableExport, UUID> {
    boolean existsByExportNumber(String exportNumber);
}
