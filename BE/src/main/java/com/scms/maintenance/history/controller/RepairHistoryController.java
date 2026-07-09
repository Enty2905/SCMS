package com.scms.maintenance.history.controller;

import com.scms.common.response.ApiResponse;
import com.scms.maintenance.history.dto.request.CreateRepairHistoryRequest;
import com.scms.maintenance.history.dto.response.RepairHistoryResponse;
import com.scms.maintenance.history.service.RepairHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/maintenance/repair-histories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Repair History", description = "Quản lý lịch sử sửa chữa thiết bị")
public class RepairHistoryController {

    RepairHistoryService repairHistoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    @Operation(summary = "Ghi lại lịch sử sửa chữa thiết bị sau khi hoàn thành")
    public ApiResponse<RepairHistoryResponse> recordHistory(
            @Valid @RequestBody CreateRepairHistoryRequest req,
            Authentication authentication
    ) {
        RepairHistoryResponse response = repairHistoryService.recordHistory(req, authentication.getName());
        return ApiResponse.created("Lịch sử sửa chữa đã được ghi nhận", response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'REPAIR_MANAGER')")
    @Operation(summary = "Danh sách lịch sử sửa chữa thiết bị (Phân trang, hỗ trợ lọc theo ID thiết bị, mã KKS, tên thiết bị, số PCT)")
    public ApiResponse<Page<RepairHistoryResponse>> getHistories(
            @RequestParam(required = false) UUID equipmentId,
            @RequestParam(required = false) String kksCode,
            @RequestParam(required = false) String equipmentName,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(repairHistoryService.getHistories(equipmentId, kksCode, equipmentName, orderNumber, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'REPAIR_MANAGER')")
    @Operation(summary = "Xem chi tiết một bản ghi lịch sử sửa chữa")
    public ApiResponse<RepairHistoryResponse> getHistoryById(@PathVariable UUID id) {
        return ApiResponse.success(repairHistoryService.getHistoryById(id));
    }
}
