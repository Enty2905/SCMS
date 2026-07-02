package com.scms.user.controller;

import com.scms.user.dto.request.RoleRequest;
import com.scms.common.response.ApiResponse;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Role Management", description = "API quản lý vai trò (ADMIN)")
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {

    RoleService roleService;

    @GetMapping(produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Lấy tất cả roles", description = "Chỉ ADMIN và HR được phép xem")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách role thành công",
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = ApiResponse.class)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền")
    })
    public org.springframework.http.ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        return org.springframework.http.ResponseEntity.ok(
                ApiResponse.success(roleService.getAllRoles())
        );
    }

    @Operation(summary = "Lấy chi tiết role theo ID (ADMIN)")
    @GetMapping("/{roleId}")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable UUID roleId) {
        return ApiResponse.success(roleService.getRoleById(roleId));
    }

    @Operation(summary = "Tạo role mới (ADMIN)")
    @PostMapping
    public ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        return ApiResponse.created("Tạo role thành công", roleService.createRole(request));
    }

    @Operation(summary = "Cập nhật role (ADMIN)")
    @PutMapping("/{roleId}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable UUID roleId,
            @RequestBody @Valid RoleRequest request) {
        return ApiResponse.success("Cập nhật role thành công", roleService.updateRole(roleId, request));
    }

    @Operation(summary = "Xóa role (ADMIN)")
    @DeleteMapping("/{roleId}")
    public ApiResponse<Void> deleteRole(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
        return ApiResponse.success("Xóa role thành công", null);
    }
}
