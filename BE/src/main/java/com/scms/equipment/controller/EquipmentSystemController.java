package com.scms.equipment.controller;

import com.scms.common.response.ApiResponse;
import com.scms.equipment.dto.request.EquipmentSystemRequest;
import com.scms.equipment.dto.response.EquipmentSystemResponse;
import com.scms.equipment.service.EquipmentSystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Equipment System Management", description = "API quản lý hệ thống thiết bị")
@RestController
@RequestMapping("/equipment-systems")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EquipmentSystemController {

    private static final Logger log = LoggerFactory.getLogger(EquipmentSystemController.class);
    EquipmentSystemService equipmentSystemService;

    @Operation(summary = "Tạo mới hệ thống thiết bị")
    @PostMapping
    public ApiResponse<EquipmentSystemResponse> createSystem(@RequestBody @Valid EquipmentSystemRequest request) {
        return ApiResponse.created("Tạo hệ thống thiết bị thành công", equipmentSystemService.createSystem(request));
    }

    @Operation(summary = "Cập nhật hệ thống thiết bị")
    @PutMapping("/{id}")
    public ApiResponse<EquipmentSystemResponse> updateSystem(
            @PathVariable UUID id,
            @RequestBody @Valid EquipmentSystemRequest request) {
        return ApiResponse.<EquipmentSystemResponse>builder()
                .status(200)
                .message("Cập nhật hệ thống thiết bị thành công")
                .data(equipmentSystemService.updateSystem(id, request))
                .build();
    }

    @Operation(summary = "Lấy chi tiết hệ thống thiết bị theo ID")
    @GetMapping("/{id}")
    public ApiResponse<EquipmentSystemResponse> getSystemById(@PathVariable UUID id) {
        return ApiResponse.<EquipmentSystemResponse>builder()
                .status(200)
                .message("Lấy hệ thống thiết bị thành công")
                .data(equipmentSystemService.getSystemById(id))
                .build();
    }

    @Operation(summary = "Lấy tất cả hệ thống thiết bị")
    @GetMapping
    public ApiResponse<List<EquipmentSystemResponse>> getAllSystems() {
        return ApiResponse.<List<EquipmentSystemResponse>>builder()
                .status(200)
                .message("Lấy danh sách hệ thống thiết bị thành công")
                .data(equipmentSystemService.getAllSystems())
                .build();
    }

    @Operation(summary = "Tìm kiếm hệ thống thiết bị theo từ khóa (tên / mã)")
    @GetMapping("/search")
    public ApiResponse<List<EquipmentSystemResponse>> searchSystems(@RequestParam String keyword) {
        return ApiResponse.<List<EquipmentSystemResponse>>builder()
                .status(200)
                .message("Tìm kiếm hệ thống thiết bị thành công")
                .data(equipmentSystemService.searchSystems(keyword))
                .build();
    }

    @Operation(summary = "Xóa hệ thống thiết bị theo ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSystem(@PathVariable UUID id) {
        equipmentSystemService.deleteSystem(id);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa hệ thống thiết bị thành công")
                .build();
    }
}
