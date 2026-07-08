package com.scms.inventory.consumable.repository;

import com.scms.inventory.consumable.entity.Consumable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsumableRepository extends JpaRepository<Consumable, UUID> {

    Optional<Consumable> findByCode(String code);

    @Query("SELECT c FROM Consumable c WHERE " +
            "(:code IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) AND " +
            "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Consumable> searchByCodeAndName(@Param("code") String code, @Param("name") String name, Pageable pageable);

    @Query("SELECT MAX(c.code) FROM Consumable c WHERE c.code LIKE 'VTTH-%'")
    String findMaxCode();
}
