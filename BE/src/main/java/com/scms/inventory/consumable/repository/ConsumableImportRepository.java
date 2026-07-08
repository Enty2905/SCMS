package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.ConsumableImport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConsumableImportRepository extends JpaRepository<ConsumableImport, UUID> {

    /**
     * Tìm import_number lớn nhất theo prefix để sinh số tiếp theo.
     * Pattern: PNK-VTTH-YYYYMM-NNN
     */
    @Query("SELECT MAX(ci.importNumber) FROM ConsumableImport ci WHERE ci.importNumber LIKE :prefix%")
    String findMaxImportNumberByPrefix(@Param("prefix") String prefix);
}
