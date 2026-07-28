package com.scms.maintenance.history.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.repository.EquipmentRepository;
import com.scms.maintenance.history.dto.request.CreateRepairHistoryRequest;
import com.scms.maintenance.history.dto.response.RepairHistoryResponse;
import com.scms.maintenance.history.entity.RepairHistory;
import com.scms.maintenance.history.repository.RepairHistoryRepository;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.maintenance.workorder.repository.WorkOrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RepairHistoryService {

    RepairHistoryRepository repairHistoryRepository;
    EquipmentRepository equipmentRepository;
    WorkOrderRepository workOrderRepository;
    UserRepository userRepository;

    @Transactional
    public RepairHistoryResponse recordHistory(CreateRepairHistoryRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Equipment equipment = equipmentRepository.findById(req.getEquipmentId())
                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));

        WorkOrder workOrder = null;
        if (req.getOrderId() != null) {
            workOrder = workOrderRepository.findById(req.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));
        }

        RepairHistory history = RepairHistory.builder()
                .equipment(equipment)
                .workOrder(workOrder)
                .description(req.getDescription())
                .repairedAt(req.getRepairedAt())
                .repairedBy(user)
                .build();

        repairHistoryRepository.save(history);
        return toResponse(history);
    }

    @Transactional(readOnly = true)
    public Page<RepairHistoryResponse> getHistories(
        UUID equipmentId,
        String kksCode,
        String equipmentName,
        String orderNumber,
        Pageable pageable
    ) {
        return repairHistoryRepository.findByFilters(equipmentId, kksCode, equipmentName, orderNumber, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public RepairHistoryResponse getHistoryById(UUID historyId) {
        RepairHistory history = repairHistoryRepository.findByIdWithDetails(historyId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(history);
    }

    private RepairHistoryResponse toResponse(RepairHistory r) {
        if (r == null) return null;
        return RepairHistoryResponse.builder()
                .historyId(r.getHistoryId())
                .equipmentId(r.getEquipment().getId())
                .equipmentKksCode(r.getEquipment().getKksCode())
                .equipmentName(r.getEquipment().getEquipmentName())
                .orderId(r.getWorkOrder() != null ? r.getWorkOrder().getOrderId() : null)
                .orderNumber(r.getWorkOrder() != null ? r.getWorkOrder().getOrderNumber() : null)
                .description(r.getDescription())
                .repairedAt(r.getRepairedAt())
                .repairedByUsername(r.getRepairedBy() != null ? r.getRepairedBy().getUsername() : null)
                .repairedByName(r.getRepairedBy() != null && r.getRepairedBy().getEmployee() != null
                        ? r.getRepairedBy().getEmployee().getName() : null)
                .build();
    }
}
