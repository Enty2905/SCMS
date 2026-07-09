package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.ConsumableImportItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConsumableImportItemRepository extends JpaRepository<ConsumableImportItem, UUID> {

    /**
     * Tổng số lượng đã nhập của một vật tư tiêu hao.
     */
    @Query("SELECT COALESCE(SUM(ii.quantity), 0) FROM ConsumableImportItem ii WHERE ii.consumable.consumableId = :consumableId")
    Long sumImportedQuantityByConsumableId(@Param("consumableId") UUID consumableId);
}
