package com.scms.maintenance.repairrequest.controller;

import com.scms.common.response.ApiResponse;
import com.scms.maintenance.repairrequest.dto.response.RepairRequestResponse;
import com.scms.maintenance.repairrequest.service.RepairRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance/requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Repair Request", description = "Quản lý yêu cầu sửa chữa")
public class RepairRequestController {

    RepairRequestService repairRequestService;

    /**
     * Chức năng 1: Xem danh sách yêu cầu sửa chữa đang chờ xử lý (status = pending)
     * Quyền: REPAIR_MANAGER, TEAM_LEADER, ADMIN
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Danh sách yêu cầu sửa chữa chờ xử lý",
               description = "Trả về tất cả repair request có status = pending. Dành cho Quản đốc SC và Tổ trưởng.")
    public ApiResponse<List<RepairRequestResponse>> getPendingRequests() {
        return ApiResponse.success("Pending repair requests loaded", repairRequestService.getPendingRequests());
    }
}
