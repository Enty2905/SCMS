package com.scms.equipment.service;

import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.equipment.dto.request.EquipmentSystemRequest;
import com.scms.equipment.dto.response.EquipmentSystemResponse;
import com.scms.equipment.entity.EquipmentSystem;
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
public class EquipmentSystemService {

    EquipmentSystemRepository equipmentSystemRepository;

    // ── Tạo mới hệ thống thiết bị ────────────────────────────
    @Transactional
    public EquipmentSystemResponse createSystem(EquipmentSystemRequest request) {
        log.info("Creating equipment system: {}", request.getSystemName());

        if (request.getParentSystemId() != null && !equipmentSystemRepository.existsById(request.getParentSystemId())) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }

        EquipmentSystem system = EquipmentSystem.builder()
                .systemName(request.getSystemName())
                .systemCode(request.getSystemCode())
                .description(request.getDescription())
                .parentSystemId(request.getParentSystemId())
                .build();

        system = equipmentSystemRepository.save(system);
        log.info("Equipment system created with id: {}", system.getSystemId());
        return toSystemResponse(system);
    }

    // ── Cập nhật hệ thống thiết bị ───────────────────────────
    @Transactional
    public EquipmentSystemResponse updateSystem(UUID id, EquipmentSystemRequest request) {
        log.info("Updating equipment system with id: {}", id);

        EquipmentSystem system = equipmentSystemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND));

        if (request.getParentSystemId() != null) {
            if (request.getParentSystemId().equals(id)) {
                throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
            }
            if (!equipmentSystemRepository.existsById(request.getParentSystemId())) {
                throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
            }
        }

        system.setSystemName(request.getSystemName());
        system.setSystemCode(request.getSystemCode());
        system.setDescription(request.getDescription());
        system.setParentSystemId(request.getParentSystemId());

        return toSystemResponse(equipmentSystemRepository.save(system));
    }

    // ── Lấy chi tiết hệ thống thiết bị theo ID ───────────────
    public EquipmentSystemResponse getSystemById(UUID id) {
        EquipmentSystem system = equipmentSystemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND));
        return toSystemResponse(system);
    }

    // ── Lấy tất cả hệ thống thiết bị ─────────────────────────
    public List<EquipmentSystemResponse> getAllSystems() {
        return equipmentSystemRepository.findAll().stream()
                .map(this::toSystemResponse)
                .toList();
    }

    // ── Tìm kiếm hệ thống thiết bị theo từ khóa ──────────────
    public List<EquipmentSystemResponse> searchSystems(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllSystems();
        }
        return equipmentSystemRepository
                .findBySystemCodeContainingIgnoreCaseOrSystemNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::toSystemResponse)
                .toList();
    }

    // ── Xóa hệ thống thiết bị ────────────────────────────────
    @Transactional
    public void deleteSystem(UUID id) {
        log.info("Deleting equipment system with id: {}", id);
        if (!equipmentSystemRepository.existsById(id)) {
            throw new AppException(ErrorCode.EQUIPMENT_SYSTEM_NOT_FOUND);
        }
        equipmentSystemRepository.deleteById(id);
    }

    // ── Helper: Map EquipmentSystem → EquipmentSystemResponse ─
    public EquipmentSystemResponse toSystemResponse(EquipmentSystem system) {
        return EquipmentSystemResponse.builder()
                .systemId(system.getSystemId())
                .systemName(system.getSystemName())
                .systemCode(system.getSystemCode())
                .description(system.getDescription())
                .parentSystemId(system.getParentSystemId())
                .build();
    }
}
