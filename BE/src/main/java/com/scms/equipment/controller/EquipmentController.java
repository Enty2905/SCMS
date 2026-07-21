package com.scms.equipment.controller;

import com.scms.common.response.ApiResponse;
import com.scms.equipment.dto.request.EquipmentRequest;
import com.scms.equipment.dto.response.EquipmentResponse;
import com.scms.equipment.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Equipment Management", description = "API quản lý thiết bị")
@RestController
@RequestMapping("/equipment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EquipmentController {

    EquipmentService equipmentService;

    @Operation(summary = "Tạo mới thiết bị")
    @PostMapping
    public ApiResponse<EquipmentResponse> createEquipment(@RequestBody @Valid EquipmentRequest request) {
        return ApiResponse.created("Tạo thiết bị thành công", equipmentService.createEquipment(request));
    }

    @Operation(summary = "Cập nhật thiết bị")
    @PutMapping("/{id}")
    public ApiResponse<EquipmentResponse> updateEquipment(
            @PathVariable UUID id,
            @RequestBody @Valid EquipmentRequest request) {
        return ApiResponse.<EquipmentResponse>builder()
                .status(200)
                .message("Cập nhật thiết bị thành công")
                .data(equipmentService.updateEquipment(id, request))
                .build();
    }

    @Operation(summary = "Lấy chi tiết thiết bị theo ID")
    @GetMapping("/{id}")
    public ApiResponse<EquipmentResponse> getEquipmentById(@PathVariable UUID id) {
        return ApiResponse.<EquipmentResponse>builder()
                .status(200)
                .message("Lấy thiết bị thành công")
                .data(equipmentService.getEquipmentById(id))
                .build();
    }

    @Operation(summary = "Lấy tất cả thiết bị")
    @GetMapping
    public ApiResponse<List<EquipmentResponse>> getAllEquipments() {
        return ApiResponse.<List<EquipmentResponse>>builder()
                .status(200)
                .message("Lấy danh sách thiết bị thành công")
                .data(equipmentService.getAllEquipments())
                .build();
    }

    @Operation(summary = "Tìm kiếm thiết bị theo từ khóa (mã KKS / tên)")
    @GetMapping("/search")
    public ApiResponse<List<EquipmentResponse>> searchEquipments(@RequestParam String keyword) {
        return ApiResponse.<List<EquipmentResponse>>builder()
                .status(200)
                .message("Tìm kiếm thiết bị thành công")
                .data(equipmentService.searchEquipments(keyword))
                .build();
    }

    @Operation(summary = "Xóa thiết bị theo ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteEquipment(@PathVariable UUID id) {
        equipmentService.deleteEquipment(id);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa thiết bị thành công")
                .build();
    }
}