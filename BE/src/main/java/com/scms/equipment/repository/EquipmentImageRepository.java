package com.scms.equipment.repository;

import com.scms.equipment.entity.EquipmentImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentImageRepository extends JpaRepository<EquipmentImage, UUID> {
    List<EquipmentImage> findByEquipmentId(UUID equipmentId);
}
