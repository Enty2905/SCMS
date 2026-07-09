package com.scms.inventory.consumable.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.request.ConsumableImportRequest;
import com.scms.inventory.consumable.dto.response.ConsumableImportResponse;
import com.scms.inventory.consumable.service.ConsumableImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Consumable Import", description = "API nhập kho vật tư tiêu hao")
@RestController
@RequestMapping("/consumable-imports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConsumableImportController {

    ConsumableImportService importService;

    @Operation(summary = "Tạo phiếu nhập kho vật tư tiêu hao")
    @PostMapping
    public ApiResponse<ConsumableImportResponse> createImport(
            @RequestBody @Valid ConsumableImportRequest request) {
        return ApiResponse.created("Tạo phiếu nhập kho thành công",
                importService.createImport(request));
    }

    @Operation(summary = "Lấy danh sách phiếu nhập kho (phân trang)")
    @GetMapping
    public ApiResponse<PagedResponse<ConsumableImportResponse>> getImports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ConsumableImportResponse>>builder()
                .status(200)
                .message("Lấy danh sách phiếu nhập thành công")
                .data(importService.getImports(page, size))
                .build();
    }

    @Operation(summary = "Lấy chi tiết phiếu nhập kho theo ID")
    @GetMapping("/{id}")
    public ApiResponse<ConsumableImportResponse> getImportById(@PathVariable UUID id) {
        return ApiResponse.success("Lấy phiếu nhập thành công",
                importService.getImportById(id));
    }
}
