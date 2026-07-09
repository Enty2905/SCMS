package com.scms.repairrequest.controller;

import com.scms.common.response.ApiResponse;
import com.scms.repairrequest.dto.request.CreateRepairRequestDto;
import com.scms.repairrequest.dto.response.RepairRequestResponse;
import com.scms.repairrequest.service.RepairRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/repair-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Repair Request", description = "Quản lý yêu cầu sửa chữa thiết bị")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class RepairRequestController {

    RepairRequestService repairRequestService;

    // ─────────────────────────────────────────────────────────────────────────
    // USER STORY 1 – Trưởng Ca: Tạo mới yêu cầu sửa chữa
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIFT_LEADER', 'OPS_MANAGER')")
    @Operation(
        summary     = "[US1] Tạo yêu cầu sửa chữa mới",
        description = "Trưởng Ca/Kíp vận hành tạo yêu cầu khi phát hiện thiết bị bị hỏng. "
                    + "Status mặc định = processing. Người tạo được lấy tự động từ Token."
    )
    public ApiResponse<RepairRequestResponse> createRequest(
            @Valid @RequestBody CreateRepairRequestDto dto) {
        return ApiResponse.created("Yêu cầu sửa chữa đã được tạo thành công",
                repairRequestService.createRequest(dto));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER STORY 1 – Trưởng Ca: Xóa yêu cầu (chỉ được xóa khi còn pending)
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIFT_LEADER', 'OPS_MANAGER')")
    @Operation(
        summary     = "[US1] Xóa yêu cầu sửa chữa",
        description = "Chỉ người tạo mới được xóa, và chỉ khi status còn là 'processing'. "
                    + "Nếu đã được Quản đốc xử lý xong (done) thì không thể xóa."
    )
    public ApiResponse<Void> deleteRequest(@PathVariable UUID requestId) {
        repairRequestService.deleteRequest(requestId);
        return ApiResponse.success("Xóa yêu cầu sửa chữa thành công", null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER STORY 2 – Trưởng Ca: Xem danh sách request do mình tạo
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'SHIFT_LEADER', 'OPS_MANAGER')")
    @Operation(
        summary     = "[US2] Xem danh sách yêu cầu tôi đã tạo",
        description = "Trưởng Ca xem lại toàn bộ yêu cầu sửa chữa do chính mình tạo, mới nhất trước."
    )
    public ApiResponse<List<RepairRequestResponse>> getMyRequests() {
        return ApiResponse.success("Danh sách yêu cầu sửa chữa của bạn",
                repairRequestService.getMyRequests());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER STORY 2 – Quản đốc SC / Tổ trưởng: Xem tất cả, lọc theo status
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(
        summary     = "[US2] Xem tất cả yêu cầu sửa chữa (lọc theo status)",
        description = "Quản đốc SC và Tổ trưởng xem toàn bộ yêu cầu. "
                    + "?status=processing → chỉ yêu cầu đang xử lý. Để trống → lấy tất cả."
    )
    public ApiResponse<List<RepairRequestResponse>> getAllRequests(
            @RequestParam(required = false) String status) {
        return ApiResponse.success("Danh sách yêu cầu sửa chữa",
                repairRequestService.getAllRequests(status));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API cũ giữ lại để không break API của WorkOrder module
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Danh sách yêu cầu sửa chữa chờ xử lý (legacy endpoint)")
    public ApiResponse<List<RepairRequestResponse>> getPendingRequests() {
        return ApiResponse.success("Pending repair requests loaded",
                repairRequestService.getPendingRequests());
    }
}
