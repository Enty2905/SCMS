package com.scms.repairrequest.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.repository.EquipmentRepository;
import com.scms.repairrequest.dto.request.CreateRepairRequestDto;
import com.scms.repairrequest.dto.response.RepairRequestResponse;
import com.scms.repairrequest.entity.RepairRequest;
import com.scms.repairrequest.repository.RepairRequestRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    EquipmentRepository equipmentRepository;
    UserRepository userRepository;

    // ── User Story 1: Tạo mới yêu cầu sửa chữa ──────────────────────────────

    /**
     * Trưởng Ca tạo một yêu cầu sửa chữa mới cho thiết bị đang có vấn đề.
     * - Tự động lấy thông tin người tạo từ SecurityContext (không cần truyền userId)
     * - Tự động set status = "pending", priority mặc định là "medium"
     */
    @Transactional
    public RepairRequestResponse createRequest(CreateRepairRequestDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Equipment equipment = equipmentRepository.findById(dto.getEquipmentId())
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));

        RepairRequest request = RepairRequest.builder()
                .equipment(equipment)
                .createdBy(currentUser)
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : "medium")
                .build();

        return toResponse(repairRequestRepository.save(request));
    }

    // ── User Story 1: Xóa yêu cầu sửa chữa ──────────────────────────────────

    /**
     * Trưởng Ca chỉ được xóa request do chính mình tạo VÀ chỉ khi status còn là "pending".
     */
    @Transactional
    public void deleteRequest(UUID requestId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        RepairRequest request = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REPAIR_REQUEST_NOT_FOUND));

        // Chỉ người tạo mới được xóa
        if (!request.getCreatedBy().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Chỉ xóa được khi còn "processing"
        if (!"processing".equals(request.getStatus())) {
            throw new AppException(ErrorCode.REPAIR_REQUEST_NOT_FOUND);
        }

        request.setDeleted(true);
        repairRequestRepository.save(request);
    }

    // ── User Story 2: Xem danh sách request ──────────────────────────────────

    /**
     * Trưởng Ca xem danh sách request do chính mình tạo.
     */
    public List<RepairRequestResponse> getMyRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return repairRequestRepository
                .findByCreatedByUserIdWithDetails(currentUser.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Quản đốc SC / Tổ trưởng xem toàn bộ request, có thể lọc theo status.
     * - status = "pending" → chỉ request chờ xử lý
     * - status = null      → tất cả
     */
    public List<RepairRequestResponse> getAllRequests(String status) {
        return repairRequestRepository.findAllWithDetailsAndStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Chức năng cũ (giữ lại để không ảnh hưởng WorkOrder module)
     */
    public List<RepairRequestResponse> getPendingRequests() {
        return repairRequestRepository.findByStatusWithDetails("processing")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lấy entity dùng nội bộ (WorkOrderService cần - backward compat)
     */
    public RepairRequest getEntityById(UUID requestId) {
        return repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REPAIR_REQUEST_NOT_FOUND));
    }

    // ── Mapping helper ────────────────────────────────────────────────────────

    public RepairRequestResponse toResponse(RepairRequest r) {
        return RepairRequestResponse.builder()
                .requestId(r.getRequestId())
                .priority(r.getPriority())
                .status(r.getStatus())
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                .createdByUsername(r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null)
                .createdByName(r.getCreatedBy() != null && r.getCreatedBy().getEmployee() != null
                        ? r.getCreatedBy().getEmployee().getName() : null)
                .equipmentId(r.getEquipment() != null ? r.getEquipment().getId() : null)
                .equipmentKksCode(r.getEquipment() != null ? r.getEquipment().getKksCode() : null)
                .equipmentName(r.getEquipment() != null ? r.getEquipment().getEquipmentName() : null)
                .equipmentType(r.getEquipment() != null ? r.getEquipment().getEquipmentType() : null)
                .equipmentLocation(r.getEquipment() != null ? r.getEquipment().getLocation() : null)
                .equipmentStatus(r.getEquipment() != null ? r.getEquipment().getStatus() : null)
                .build();
    }
}
