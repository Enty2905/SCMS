package com.scms.inventory.sparepart.repository;

import com.scms.inventory.sparepart.entity.SparePartImport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SparePartImportRepository extends JpaRepository<SparePartImport, UUID> {

    @Query("SELECT MAX(i.importNumber) FROM SparePartImport i WHERE i.importNumber LIKE CONCAT(:prefix, '%')")
    String findMaxImportNumberByPrefix(@Param("prefix") String prefix);

}
