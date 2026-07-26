package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.ConsumableExportItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConsumableExportItemRepository extends JpaRepository<ConsumableExportItem, UUID> {
}
