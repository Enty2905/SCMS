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

    Optional<Consumable> findByCodeAndIsDeletedFalse(String code);

    Page<Consumable> findByIsDeletedFalse(Pageable pageable);

    Optional<Consumable> findByConsumableIdAndIsDeletedFalse(UUID id);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM ConsumableRequest r JOIN r.items i WHERE i.consumable.consumableId = :id AND r.status = 'pending'")
    boolean existsByConsumableIdAndStatusPending(@Param("id") UUID id);

    @Query("SELECT c FROM Consumable c WHERE c.isDeleted = false AND " +
            "(:code IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%'))) AND " +
            "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Consumable> searchByCodeAndName(@Param("code") String code, @Param("name") String name, Pageable pageable);

    @Query(value = "SELECT MAX(code) FROM consumable WHERE code LIKE 'VTTH-%'", nativeQuery = true)
    String findMaxCode();
}
