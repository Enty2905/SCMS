package com.scms.equipment.service;

import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.equipment.dto.request.EquipmentRequest;
import com.scms.equipment.dto.response.EquipmentResponse;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.repository.EquipmentRepository;
import com.scms.equipment.repository.EquipmentSystemRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EquipmentService {

    EquipmentRepository equipmentRepository;
    EquipmentSystemRepository equipmentSystemRepository;

    // ── Tạo mới thiết bị ──────────────────────────────────────
    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        log.info("Creating equipment: {}", request.getEquipmentName());

        if (request.getSystemId() != null && !equipmentSystemRepository.existsById(request.getSystemId())) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }

        Equipment equipment = Equipment.builder()
                .kksCode(request.getKksCode())
                .equipmentName(request.getEquipmentName())
                .equipmentType(request.getEquipmentType())
                .status(request.getStatus())
                .location(request.getLocation())
                .systemId(request.getSystemId())
                .build();

        equipment = equipmentRepository.save(equipment);
        log.info("Equipment created with id: {}", equipment.getId());
        return toEquipmentResponse(equipment);
    }

    // ── Cập nhật thiết bị ─────────────────────────────────────
    @Transactional
    public EquipmentResponse updateEquipment(UUID id, EquipmentRequest request) {
        log.info("Updating equipment with id: {}", id);

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));

        if (request.getSystemId() != null && !equipmentSystemRepository.existsById(request.getSystemId())) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }

        equipment.setKksCode(request.getKksCode());
        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setEquipmentType(request.getEquipmentType());
        equipment.setStatus(request.getStatus());
        equipment.setLocation(request.getLocation());
        equipment.setSystemId(request.getSystemId());

        return toEquipmentResponse(equipmentRepository.save(equipment));
    }

    // ── Lấy chi tiết thiết bị theo ID ────────────────────────
    public EquipmentResponse getEquipmentById(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));
        return toEquipmentResponse(equipment);
    }

    // ── Lấy tất cả thiết bị ───────────────────────────────────
    public List<EquipmentResponse> getAllEquipments() {
        return equipmentRepository.findAll().stream()
                .map(this::toEquipmentResponse)
                .toList();
    }

    // ── Tìm kiếm thiết bị theo từ khóa ───────────────────────
    public List<EquipmentResponse> searchEquipments(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllEquipments();
        }
        return equipmentRepository
                .findByKksCodeContainingIgnoreCaseOrEquipmentNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::toEquipmentResponse)
                .toList();
    }

    // ── Xóa thiết bị ─────────────────────────────────────────
    @Transactional
    public void deleteEquipment(UUID id) {
        log.info("Deleting equipment with id: {}", id);
        if (!equipmentRepository.existsById(id)) {
            throw new AppException(ErrorCode.EQUIPMENT_NOT_FOUND);
        }
        equipmentRepository.deleteById(id);
    }

    // ── Helper: Map Equipment → EquipmentResponse ─────────────
    public EquipmentResponse toEquipmentResponse(Equipment equipment) {
        return EquipmentResponse.builder()
                .id(equipment.getId())
                .kksCode(equipment.getKksCode())
                .equipmentName(equipment.getEquipmentName())
                .equipmentType(equipment.getEquipmentType())
                .status(equipment.getStatus())
                .location(equipment.getLocation())
                .systemId(equipment.getSystemId())
                .build();
    }
}