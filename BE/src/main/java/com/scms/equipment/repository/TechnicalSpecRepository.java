package com.scms.equipment.repository;

import com.scms.equipment.entity.TechnicalSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TechnicalSpecRepository extends JpaRepository<TechnicalSpec, UUID> {
    List<TechnicalSpec> findByEquipmentId(UUID equipmentId);
    void deleteByEquipmentId(UUID equipmentId);
}
