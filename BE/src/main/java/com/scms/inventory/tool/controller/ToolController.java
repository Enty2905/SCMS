package com.scms.inventory.tool.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.tool.dto.request.ToolDisposeRequest;
import com.scms.inventory.tool.dto.request.ToolRequest;
import com.scms.inventory.tool.dto.response.ToolResponse;
import com.scms.inventory.tool.service.ToolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Tool Management", description = "API quản lý công cụ dụng cụ (CCDC)")
@RestController
@RequestMapping("/tools")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ToolController {

    ToolService toolService;

    // Thêm mới CCDC
    @Operation(summary = "Thêm mới công cụ dụng cụ")
    @PostMapping
    public ApiResponse<ToolResponse> createTool(
            @RequestBody @Valid ToolRequest request) {
        return ApiResponse.created("Thêm CCDC thành công",
                toolService.createTool(request));
    }

    // Lấy danh sách, tìm theo tên và chủng loại
    @Operation(summary = "Lấy danh sách CCDC (phân trang, tìm theo tên và chủng loại)")
    @GetMapping
    public ApiResponse<PagedResponse<ToolResponse>> getTools(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ToolResponse>>builder()
                .status(200)
                .message("Lấy danh sách CCDC thành công")
                .data(toolService.getTools(keyword, category, page, size))
                .build();
    }

    // Lấy chi tiết theo ID
    @Operation(summary = "Lấy chi tiết CCDC theo ID")
    @GetMapping("/{id}")
    public ApiResponse<ToolResponse> getToolById(@PathVariable("id") UUID id) {
        return ApiResponse.success("Lấy thông tin CCDC thành công",
                toolService.getToolById(id));
    }

    // Cập nhật CCDC
    @Operation(summary = "Cập nhật công cụ dụng cụ")
    @PutMapping("/{id}")
    public ApiResponse<ToolResponse> updateTool(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ToolRequest request) {
        return ApiResponse.success("Cập nhật CCDC thành công",
                toolService.updateTool(id, request));
    }

    // Xóa CCDC (Soft Delete)
    @Operation(summary = "Xóa công cụ dụng cụ")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTool(@PathVariable("id") UUID id) {
        toolService.deleteTool(id);
        return ApiResponse.success("Xóa CCDC thành công", null);
    }

    // Báo hỏng CCDC
    @Operation(summary = "Báo hỏng CCDC (giảm available, tăng damaged)")
    @PatchMapping("/{id}/report-damaged")
    public ApiResponse<ToolResponse> reportDamaged(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ToolDisposeRequest request) {
        return ApiResponse.success("Báo hỏng CCDC thành công",
                toolService.reportDamaged(id, request));
    }

    // Huỷ CCDC bị hư hỏng
    @Operation(summary = "Huỷ CCDC bị hư hỏng (báo cáo số lượng hỏng)")
    @PatchMapping("/{id}/dispose-damaged")
    public ApiResponse<ToolResponse> disposeDamaged(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ToolDisposeRequest request) {
        return ApiResponse.success("Báo cáo hư hỏng CCDC thành công",
                toolService.disposeDamaged(id, request));
    }

    // Lấy danh sách CCDC có hư hỏng
    @Operation(summary = "Lấy danh sách CCDC có hư hỏng (damagedQuantity > 0)")
    @GetMapping("/damaged")
    public ApiResponse<PagedResponse<ToolResponse>> getDamagedTools(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ToolResponse>>builder()
                .status(200)
                .message("Lấy danh sách CCDC hư hỏng thành công")
                .data(toolService.getDamagedTools(keyword, category, page, size))
                .build();
    }
}

