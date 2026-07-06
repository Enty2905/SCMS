package com.scms.maintenance.repairrequest.service;

import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.maintenance.repairrequest.dto.response.RepairRequestResponse;
import com.scms.maintenance.repairrequest.entity.RepairRequest;
import com.scms.maintenance.repairrequest.repository.RepairRequestRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RepairRequestService {

    RepairRequestRepository repairRequestRepository;

    /**
     * Chức năng 1: Lấy danh sách repair request có status = pending
     * Dành cho: REPAIR_MANAGER, TEAM_LEADER
     */
    public List<RepairRequestResponse> getPendingRequests() {
        return repairRequestRepository.findByStatusWithDetails("pending")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lấy một repair request theo ID (dùng nội bộ khi tạo WorkOrder)
     */
    public RepairRequest getEntityById(UUID requestId) {
        return repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REPAIR_REQUEST_NOT_FOUND));
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    public RepairRequestResponse toResponse(RepairRequest r) {
        return RepairRequestResponse.builder()
                .requestId(r.getRequestId())
                .priority(r.getPriority())
                .status(r.getStatus())
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                // Người tạo
                .createdByUsername(r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null)
                .createdByName(r.getCreatedBy() != null && r.getCreatedBy().getEmployee() != null
                        ? r.getCreatedBy().getEmployee().getName() : null)
                // Thiết bị
                .equipmentId(r.getEquipment() != null ? r.getEquipment().getId() : null)
                .equipmentKksCode(r.getEquipment() != null ? r.getEquipment().getKksCode() : null)
                .equipmentName(r.getEquipment() != null ? r.getEquipment().getEquipmentName() : null)
                .equipmentType(r.getEquipment() != null ? r.getEquipment().getEquipmentType() : null)
                .equipmentLocation(r.getEquipment() != null ? r.getEquipment().getLocation() : null)
                .equipmentStatus(r.getEquipment() != null ? r.getEquipment().getStatus() : null)
                .build();
    }
}
