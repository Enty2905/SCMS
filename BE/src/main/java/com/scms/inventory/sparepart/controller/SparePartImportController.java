package com.scms.inventory.sparepart.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.request.SparePartImportRequest;
import com.scms.inventory.sparepart.dto.response.SparePartImportResponse;
import com.scms.inventory.sparepart.service.SparePartImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Spare Part Import", description = "API nhập kho vật tư thay thế")
@RestController
@RequestMapping("/spare-part-imports")
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SparePartImportController {

    SparePartImportService importService;

    @Operation(summary = "Tạo phiếu nhập kho vật tư thay thế")
    @PostMapping
    public ApiResponse<SparePartImportResponse> createImport(
            @RequestBody @Valid SparePartImportRequest request) {
        return ApiResponse.created("Tạo phiếu nhập kho thành công",
                importService.createImport(request));
    }

    @Operation(summary = "Lấy danh sách phiếu nhập kho (phân trang)")
    @GetMapping
    public ApiResponse<PagedResponse<SparePartImportResponse>> getImports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<SparePartImportResponse>>builder()
                .status(200)
                .message("Lấy danh sách phiếu nhập thành công")
                .data(importService.getImports(page, size))
                .build();
    }

    @Operation(summary = "Lấy chi tiết phiếu nhập kho theo ID")
    @GetMapping("/{id}")
    public ApiResponse<SparePartImportResponse> getImportById(@PathVariable UUID id) {
        return ApiResponse.success("Lấy phiếu nhập thành công",
                importService.getImportById(id));
    }
}
