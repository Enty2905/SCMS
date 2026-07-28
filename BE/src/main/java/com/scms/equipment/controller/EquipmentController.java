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

import com.scms.equipment.dto.response.EquipmentImageResponse;
import com.scms.equipment.dto.response.TechnicalParamResponse;
import com.scms.equipment.dto.response.UnitResponse;

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

    @Operation(summary = "Lấy tất cả ảnh của một thiết bị")
    @GetMapping("/{equipmentId}/images")
    public ApiResponse<List<EquipmentImageResponse>> getEquipmentImages(@PathVariable UUID equipmentId) {
        return ApiResponse.<List<EquipmentImageResponse>>builder()
                .status(200)
                .message("Lấy danh sách ảnh thành công")
                .data(equipmentService.getEquipmentImages(equipmentId))
                .build();
    }

    @Operation(summary = "Tải lên ảnh mới cho thiết bị")
    @PostMapping(value = "/{equipmentId}/images/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<EquipmentImageResponse> uploadEquipmentImage(
            @PathVariable UUID equipmentId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ApiResponse.<EquipmentImageResponse>builder()
                .status(201)
                .message("Tải ảnh lên thành công")
                .data(equipmentService.uploadEquipmentImage(equipmentId, file))
                .build();
    }

    @Operation(summary = "Xóa ảnh của thiết bị theo ID ảnh")
    @DeleteMapping("/images/{imageId}")
    public ApiResponse<Void> deleteEquipmentImage(@PathVariable UUID imageId) {
        equipmentService.deleteEquipmentImage(imageId);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa ảnh thành công")
                .build();
    }

    @Operation(summary = "Xem trực tiếp tệp ảnh thiết bị")
    @GetMapping("/images/file/{filename}")
    public org.springframework.http.ResponseEntity<byte[]> getEquipmentImageFile(@PathVariable String filename) {
        byte[] imageBytes = equipmentService.getEquipmentImageFile(filename);
        
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        org.springframework.http.MediaType mediaType = org.springframework.http.MediaType.IMAGE_JPEG;
        if (ext.equals("png")) {
            mediaType = org.springframework.http.MediaType.IMAGE_PNG;
        } else if (ext.equals("gif")) {
            mediaType = org.springframework.http.MediaType.IMAGE_GIF;
        } else if (ext.equals("webp")) {
            mediaType = org.springframework.http.MediaType.parseMediaType("image/webp");
        }

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(mediaType);
        headers.setCacheControl(org.springframework.http.CacheControl.maxAge(30, java.util.concurrent.TimeUnit.DAYS).cachePublic());
        
        return new org.springframework.http.ResponseEntity<>(imageBytes, headers, org.springframework.http.HttpStatus.OK);
    }

    @Operation(summary = "Lấy tất cả tham số kỹ thuật cấu hình sẵn")
    @GetMapping("/params")
    public ApiResponse<List<TechnicalParamResponse>> getAllParams() {
        return ApiResponse.<List<TechnicalParamResponse>>builder()
                .status(200)
                .message("Lấy danh sách tham số thành công")
                .data(equipmentService.getAllTechnicalParams())
                .build();
    }

    @Operation(summary = "Lấy tất cả đơn vị cấu hình sẵn")
    @GetMapping("/units")
    public ApiResponse<List<UnitResponse>> getAllUnits() {
        return ApiResponse.<List<UnitResponse>>builder()
                .status(200)
                .message("Lấy danh sách đơn vị thành công")
                .data(equipmentService.getAllUnits())
                .build();
    }
}