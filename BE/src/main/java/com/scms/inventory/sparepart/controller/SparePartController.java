package com.scms.inventory.sparepart.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.request.SparePartRequest;
import com.scms.inventory.sparepart.dto.response.SparePartResponse;
import com.scms.inventory.sparepart.service.SparePartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Spare Part Management", description = "API quản lý vật tư thay thế")
@RestController
@RequestMapping("/spare-parts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SparePartController {

    SparePartService sparePartService;

    // Thêm mới vật tư thay thế
    @Operation(summary = "Thêm mới vật tư thay thế")
    @PostMapping
    public ApiResponse<SparePartResponse> createSparePart(
            @RequestBody @Valid SparePartRequest request) {
        return ApiResponse.created("Thêm vật tư thay thế thành công",
                sparePartService.createSparePart(request));
    }

    // Lấy danh sách, tìm kiếm theo code hoặc name
    @Operation(summary = "Lấy danh sách vật tư thay thế (phân trang, tìm kiếm)")
    @GetMapping
    public ApiResponse<PagedResponse<SparePartResponse>> getSpareParts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<SparePartResponse>>builder()
                .status(200)
                .message("Lấy danh sách vật tư thay thế thành công")
                .data(sparePartService.getSpareParts(keyword, page, size))
                .build();
    }

    // Lấy chi tiết theo ID
    @Operation(summary = "Lấy chi tiết vật tư thay thế theo ID")
    @GetMapping("/{id}")
    public ApiResponse<SparePartResponse> getSparePartById(@PathVariable("id") UUID id) {
        return ApiResponse.success("Lấy thông tin vật tư thay thế thành công",
                sparePartService.getSparePartById(id));
    }

    // Cập nhật vật tư thay thế
    @Operation(summary = "Cập nhật vật tư thay thế")
    @PutMapping("/{id}")
    public ApiResponse<SparePartResponse> updateSparePart(
            @PathVariable("id") UUID id,
            @RequestBody @Valid SparePartRequest request) {
        return ApiResponse.success("Cập nhật vật tư thay thế thành công",
                sparePartService.updateSparePart(id, request));
    }

    // Xóa vật tư thay thế
    @Operation(summary = "Xóa vật tư thay thế")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSparePart(@PathVariable("id") UUID id) {
        sparePartService.deleteSparePart(id);
        return ApiResponse.success("Xóa vật tư thay thế thành công", null);
    }
}
