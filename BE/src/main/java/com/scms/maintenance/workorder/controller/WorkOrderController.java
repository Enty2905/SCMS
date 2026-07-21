package com.scms.maintenance.workorder.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.maintenance.workorder.dto.request.CreateWorkOrderRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderResponse;
import com.scms.maintenance.workorder.service.WorkOrderService;
import com.scms.maintenance.workorder.dto.request.CloseDailyLogRequest;
import com.scms.maintenance.workorder.dto.response.WorkOrderDailyLogResponse;
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

import java.util.List;
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
     * Tìm kiếm và lấy danh sách phiếu công tác có phân trang
     * Quyền: ADMIN, REPAIR_MANAGER, TEAM_LEADER, SHIFT_LEADER
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER', 'SHIFT_LEADER')")
    @Operation(summary = "Tìm kiếm phiếu công tác", description = "Lấy danh sách PCT có phân trang, hỗ trợ tìm kiếm theo số PCT hoặc nội dung")
    public ApiResponse<PagedResponse<WorkOrderResponse>> searchWorkOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(workOrderService.searchWorkOrders(keyword, page, size));
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

    // ── Daily Log APIs ───────────────────────────────────────────────────────

    @PostMapping("/{orderId}/daily-logs/open")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIFT_LEADER')")
    @Operation(summary = "Mở phiếu công tác hàng ngày", description = "Trưởng ca mở phiếu công tác để bắt đầu phiên làm việc trong ngày")
    public ApiResponse<WorkOrderDailyLogResponse> openDailyLog(@PathVariable UUID orderId, Authentication authentication) {
        String username = authentication.getName();
        WorkOrderDailyLogResponse response = workOrderService.openDailyLog(orderId, username);
        return ApiResponse.success("Mở phiếu công tác thành công", response);
    }

    @PostMapping("/{orderId}/daily-logs/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIFT_LEADER')")
    @Operation(summary = "Đóng phiếu công tác hàng ngày", description = "Trưởng ca đóng phiếu công tác để kết thúc phiên làm việc trong ngày")
    public ApiResponse<WorkOrderDailyLogResponse> closeDailyLog(
            @PathVariable UUID orderId,
            @RequestBody(required = false) CloseDailyLogRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WorkOrderDailyLogResponse response = workOrderService.closeDailyLog(orderId, request, username);
        return ApiResponse.success("Đóng phiếu công tác thành công", response);
    }

    @GetMapping("/{orderId}/daily-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER', 'SHIFT_LEADER')")
    @Operation(summary = "Lấy lịch sử nhật ký (đóng/mở) của PCT", description = "Lấy danh sách các phiên làm việc của PCT có phân trang")
    public ApiResponse<PagedResponse<WorkOrderDailyLogResponse>> getDailyLogs(
            @PathVariable UUID orderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(workOrderService.getDailyLogs(orderId, page, size));
    }
}
