package com.scms.inventory.consumable.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.request.ConsumableRequest;
import com.scms.inventory.consumable.dto.response.ConsumableResponse;
import com.scms.inventory.consumable.service.ConsumableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Consumable Management", description = "API quản lý vật tư tiêu hao")
@RestController
@RequestMapping("/consumables")

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConsumableController {

    ConsumableService consumableService;

    // Thêm mới vật tư tiêu hao
    @Operation(summary = "Thêm mới vật tư tiêu hao")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
    public ApiResponse<ConsumableResponse> createConsumable(
            @RequestBody @Valid ConsumableRequest request) {
        return ApiResponse.created("Thêm vật tư tiêu hao thành công",
                consumableService.createConsumable(request));
    }

    // Lấy danh sách, tìm kiếm theo code hoặc name
    @Operation(summary = "Lấy danh sách vật tư tiêu hao (phân trang, tìm kiếm)")
    @GetMapping
    public ApiResponse<PagedResponse<ConsumableResponse>> getConsumables(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ConsumableResponse>>builder()
                .status(200)
                .message("Lấy danh sách vật tư tiêu hao thành công")
                .data(consumableService.getConsumables(code, name, page, size))
                .build();
    }

    // Lấy chi tiết theo ID
    @Operation(summary = "Lấy chi tiết vật tư tiêu hao theo ID")
    @GetMapping("/{id}")
    public ApiResponse<ConsumableResponse> getConsumableById(@PathVariable("id") UUID id) {
        return ApiResponse.success("Lấy thông tin vật tư tiêu hao thành công",
                consumableService.getConsumableById(id));
    }

    // Cập nhật vật tư tiêu hao
    @Operation(summary = "Cập nhật vật tư tiêu hao")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
    public ApiResponse<ConsumableResponse> updateConsumable(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ConsumableRequest request) {
        return ApiResponse.success("Cập nhật vật tư tiêu hao thành công",
                consumableService.updateConsumable(id, request));
    }

    // Xóa vật tư tiêu hao
    @Operation(summary = "Xóa vật tư tiêu hao")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
    public ApiResponse<Void> deleteConsumable(@PathVariable("id") UUID id) {
        consumableService.deleteConsumable(id);
        return ApiResponse.success("Xóa vật tư tiêu hao thành công", null);
    }
}
