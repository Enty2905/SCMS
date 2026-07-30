package com.scms.inventory.tool.borrow.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.tool.borrow.dto.request.ToolBorrowRequest;
import com.scms.inventory.tool.borrow.dto.response.ToolBorrowResponse;
import com.scms.inventory.tool.borrow.service.ToolBorrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Tool Borrow Management", description = "API quản lý mượn/trả CCDC")
@RestController
@RequestMapping("/tool-borrows")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_TOOL')")
public class ToolBorrowController {

    ToolBorrowService toolBorrowService;

    // Tạo phiếu mượn mới
    @Operation(summary = "Tạo phiếu mượn CCDC")
    @PostMapping
    public ApiResponse<ToolBorrowResponse> createBorrow(
            @RequestBody @Valid ToolBorrowRequest request) {
        return ApiResponse.created("Tạo phiếu mượn CCDC thành công",
                toolBorrowService.createBorrow(request));
    }

    // Lấy danh sách phiếu mượn (phân trang, tìm kiếm, lọc)
    @Operation(summary = "Lấy danh sách phiếu mượn CCDC (phân trang, tìm kiếm theo tên CCDC/nhân viên, lọc status)")
    @GetMapping
    public ApiResponse<PagedResponse<ToolBorrowResponse>> getBorrows(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ToolBorrowResponse>>builder()
                .status(200)
                .message("Lấy danh sách phiếu mượn thành công")
                .data(toolBorrowService.getBorrows(keyword, status, page, size))
                .build();
    }

    // Lấy chi tiết phiếu mượn
    @Operation(summary = "Lấy chi tiết phiếu mượn CCDC theo ID")
    @GetMapping("/{id}")
    public ApiResponse<ToolBorrowResponse> getBorrowById(@PathVariable("id") UUID id) {
        return ApiResponse.success("Lấy thông tin phiếu mượn thành công",
                toolBorrowService.getBorrowById(id));
    }

    // Xác nhận trả CCDC
    @Operation(summary = "Xác nhận trả CCDC (cập nhật status = returned, trả lại availableQuantity)")
    @PatchMapping("/{id}/return")
    public ApiResponse<ToolBorrowResponse> returnBorrow(
            @PathVariable("id") UUID id,
            @RequestBody @Valid com.scms.inventory.tool.borrow.dto.request.ToolReturnRequest returnRequest) {
        return ApiResponse.success("Trả CCDC thành công",
                toolBorrowService.returnBorrow(id, returnRequest));
    }
}
