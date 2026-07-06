package com.scms.auth.controller;

import com.scms.auth.dto.request.*;
import com.scms.common.response.ApiResponse;
import com.scms.auth.dto.response.LoginResponse;
import com.scms.auth.dto.response.IntrospectResponse;
import com.scms.auth.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@Tag(name = "Authentication", description = "API đăng nhập, logout, refresh token, introspect")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @Operation(summary = "Đăng nhập – lấy access token và refresh token")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authenticationService.authenticate(request));
    }

    @Operation(summary = "Làm mới access token bằng refresh token")
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        return ApiResponse.success("Làm mới token thành công", authenticationService.refreshToken(request));
    }

    @Operation(summary = "Kiểm tra token còn hợp lệ không")
    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.success("Kết quả kiểm tra token", authenticationService.introspect(request));
    }

    @Operation(summary = "Đăng xuất – vô hiệu hóa access token và refresh token")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.success("Đăng xuất thành công", null);
    }
}