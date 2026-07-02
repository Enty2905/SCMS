package com.scms.controller;

import com.scms.dto.request.CreateUserAccountRequest;
import com.scms.dto.request.UpdateUserStatusRequest;
import com.scms.dto.response.ApiResponse;
import com.scms.dto.response.EmployeeAccountOptionResponse;
import com.scms.dto.response.UserAccountResponse;
import com.scms.service.UserAccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
