package com.scms.equipment.repository;

import com.scms.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    // Tìm kiếm theo mã KKS hoặc tên thiết bị
    List<Equipment> findByKksCodeContainingIgnoreCaseOrEquipmentNameContainingIgnoreCase(
            String kksCode,
            String equipmentName
    );

}
