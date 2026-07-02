package com.scms.equipment.repository;

import com.scms.equipment.entity.EquipmentSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentSystemRepository extends JpaRepository<EquipmentSystem, UUID> {

    List<EquipmentSystem> findBySystemCodeContainingIgnoreCaseOrSystemNameContainingIgnoreCase(
            String code,
            String name
    );
}
