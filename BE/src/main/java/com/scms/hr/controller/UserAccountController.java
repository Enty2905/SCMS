package com.scms.hr.controller;

import com.scms.common.response.ApiResponse;
import com.scms.hr.dto.request.CreateUserAccountRequest;
import com.scms.hr.dto.request.UpdateUserStatusRequest;
import com.scms.hr.dto.response.EmployeeAccountOptionResponse;
import com.scms.hr.dto.response.UserAccountResponse;
import com.scms.hr.service.UserAccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
public class UserAccountController {

    UserAccountService userAccountService;

    @GetMapping("/accounts")
    public ApiResponse<List<UserAccountResponse>> getAccounts() {
        return ApiResponse.success("Accounts loaded successfully", userAccountService.getAccounts());
    }

    @GetMapping("/employees/without-account")
    public ApiResponse<List<EmployeeAccountOptionResponse>> getEmployeesWithoutAccount() {
        return ApiResponse.success(
                "Employees without account loaded successfully",
                userAccountService.getEmployeesWithoutAccount()
        );
    }

    @PostMapping("/accounts")
    public ApiResponse<UserAccountResponse> createAccount(@Valid @RequestBody CreateUserAccountRequest request) {
        return ApiResponse.created("Account created successfully", userAccountService.createAccount(request));
    }

    @PatchMapping("/accounts/{userId}/status")
    public ApiResponse<UserAccountResponse> updateAccountStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ApiResponse.success(
                "Account status updated successfully",
                userAccountService.updateAccountStatus(userId, request)
        );
    }

    @DeleteMapping("/accounts/{userId}")
    public ApiResponse<Void> deleteAccount(@PathVariable UUID userId) {
        userAccountService.deleteAccount(userId);
        return ApiResponse.success("Account deleted successfully", null);
    }
}
