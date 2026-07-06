package com.scms.user.controller;

import com.scms.user.dto.request.*;
import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.user.dto.response.UserResponse;
import com.scms.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "User Management", description = "API quản lý tài khoản người dùng")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    // ADMIN/HR: Tạo tài khoản cho nhân viên
    @Operation(summary = "Tạo tài khoản user mới (ADMIN, HR)")
    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.created("Tạo tài khoản thành công", userService.createUser(request));
    }

    // ADMIN/HR: Lấy danh sách user có phân trang và bộ lọc
    @Operation(summary = "Lấy danh sách users có phân trang, lọc theo role/ngày/search (ADMIN, HR)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    @GetMapping
    public ApiResponse<PagedResponse<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.<PagedResponse<UserResponse>>builder()
                .status(200)
                .message("Lấy danh sách user thành công")
                .data(userService.getUsers(page, size, roleCode, fromDate, toDate, search))
                .build();
    }

    // ADMIN/HR: Lấy chi tiết 1 user
    @Operation(summary = "Lấy chi tiết user theo ID (ADMIN, HR)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable("userId") UUID userId) {
        UserResponse userResponse = userService.getUserById(userId);
        return ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Lấy thông tin user thành công")
                .data(userResponse)
                .build();
    }

    // All authenticated: Xem thông tin tài khoản bản thân
    @Operation(summary = "Xem thông tin tài khoản bản thân")
    @GetMapping("/profile")
    public ApiResponse<UserResponse> getMyInfo() {
        UserResponse userResponse = userService.getMyInfo();
        return ApiResponse.<UserResponse>builder()
                .status(200)
                .data(userResponse)
                .build();
    }

    // ADMIN: Cập nhật trạng thái và role của user
    @Operation(summary = "Cập nhật user: isActive, role (ADMIN)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable UUID userId,
            @RequestBody @Valid UserUpdateRequest request) {
        UserResponse userResponse = userService.updateUser(userId, request);
        return ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Cập nhật thành công")
                .data(userResponse)
                .build();
    }

    // All authenticated: Tự cập nhật thông tin cá nhân (phone, avatar)
    @Operation(summary = "Tự cập nhật thông tin cá nhân (phone, avatarUrl)")
    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateMyProfile(@RequestBody @Valid ProfileUpdateRequest request) {
        var updatedUser = userService.updateMyProfile(request);
        return ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Cập nhật thông tin thành công")
                .data(updatedUser)
                .build();
    }

    // All authenticated: Đổi mật khẩu bản thân
    @Operation(summary = "Đổi mật khẩu tài khoản")
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Đổi mật khẩu thành công")
                .build();
    }

    // ADMIN: Vô hiệu hóa tài khoản (soft delete)
    @Operation(summary = "Vô hiệu hóa tài khoản (ADMIN) - soft delete")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Vô hiệu hóa tài khoản thành công")
                .build();
    }
}
