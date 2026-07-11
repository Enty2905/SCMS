package com.scms.maintenance.workorder.controller;

import com.scms.common.response.ApiResponse;
import com.scms.maintenance.workorder.dto.request.CreateWorkOrderRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderResponse;
import com.scms.maintenance.workorder.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/maintenance/work-orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Work Order", description = "Quản lý phiếu công tác (PCT)")
public class WorkOrderController {

    WorkOrderService workOrderService;

    /**
     * Chức năng 2: Tạo phiếu công tác từ một repair request
     * Quyền: REPAIR_MANAGER, TEAM_LEADER, ADMIN
     *
     * Authentication được inject từ Spring Security (JWT filter đã set principal =
     * username)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Tạo phiếu công tác (PCT)", description = "Tạo PCT từ một repair request. Cần cung cấp số PCT (orderNumber do người dùng nhập), "
            +
            "người lãnh đạo, chỉ huy trực tiếp, giám sát an toàn và danh sách nhân viên thi công.")
    public ApiResponse<WorkOrderResponse> createWorkOrder(
            @Valid @RequestBody CreateWorkOrderRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WorkOrderResponse response = workOrderService.createWorkOrder(request, username);
        return ApiResponse.created("Phiếu công tác đã được tạo thành công", response);
    }

    /**
     * Lấy toàn bộ danh sách phiếu công tác (PCT)
     * Quyền: ADMIN, REPAIR_MANAGER, TEAM_LEADER, SHIFT_LEADER
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER', 'SHIFT_LEADER')")
    @Operation(summary = "Danh sách phiếu công tác", description = "Lấy toàn bộ danh sách PCT có trong hệ thống")
    public ApiResponse<java.util.List<WorkOrderResponse>> getWorkOrders() {
        return ApiResponse.success(workOrderService.getAllWorkOrders());
    }

    /**
     * Xem chi tiết một phiếu công tác
     * Quyền: ADMIN, REPAIR_MANAGER, TEAM_LEADER, SHIFT_LEADER
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER', 'SHIFT_LEADER')")
    @Operation(summary = "Chi tiết phiếu công tác", description = "Xem đầy đủ thông tin PCT theo ID")
    public ApiResponse<WorkOrderResponse> getWorkOrder(@PathVariable UUID orderId) {
        return ApiResponse.success(workOrderService.getWorkOrderById(orderId));
    }
}
