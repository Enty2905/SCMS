package com.scms.controller;

import com.scms.dto.response.ApiResponse;
import com.scms.dto.response.DepartmentResponse;
import com.scms.dto.response.EmployeeResponse;
import com.scms.service.HrDirectoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
public class HrDirectoryController {

    HrDirectoryService hrDirectoryService;

    @GetMapping("/employees")
    public ApiResponse<List<EmployeeResponse>> getEmployees() {
        return ApiResponse.success("Employees loaded successfully", hrDirectoryService.getEmployees());
    }

    @GetMapping("/departments")
    public ApiResponse<List<DepartmentResponse>> getDepartments() {
        return ApiResponse.success("Departments loaded successfully", hrDirectoryService.getDepartments());
    }
}
