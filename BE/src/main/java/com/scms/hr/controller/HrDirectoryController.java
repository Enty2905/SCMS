package com.scms.hr.controller;

import com.scms.common.response.ApiResponse;
import com.scms.hr.dto.request.DepartmentCreateRequest;
import com.scms.hr.dto.request.EmployeeUpsertRequest;
import com.scms.hr.dto.response.DepartmentResponse;
import com.scms.hr.dto.response.EmployeePositionResponse;
import com.scms.hr.dto.response.EmployeeResponse;
import com.scms.hr.service.HrDirectoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU', 'REPAIR_MANAGER', 'TEAM_LEADER')")
public class HrDirectoryController {

    HrDirectoryService hrDirectoryService;

    @GetMapping("/employees")
    public ApiResponse<List<EmployeeResponse>> getEmployees() {
        return ApiResponse.success("Employees loaded successfully", hrDirectoryService.getEmployees());
    }

    @GetMapping("/employee-positions")
    public ApiResponse<List<EmployeePositionResponse>> getEmployeePositions() {
        return ApiResponse.success("Employee positions loaded successfully", hrDirectoryService.getEmployeePositions());
    }

    @PostMapping(value = "/employees", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<EmployeeResponse> createEmployee(@Valid @ModelAttribute EmployeeUpsertRequest request) {
        return ApiResponse.created("Employee created successfully", hrDirectoryService.createEmployee(request));
    }

    @PutMapping(value = "/employees/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<EmployeeResponse> updateEmployee(
            @PathVariable UUID employeeId,
            @Valid @ModelAttribute EmployeeUpsertRequest request
    ) {
        return ApiResponse.success("Employee updated successfully", hrDirectoryService.updateEmployee(employeeId, request));
    }

    @DeleteMapping("/employees/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<Void> deleteEmployee(@PathVariable UUID employeeId) {
        hrDirectoryService.deleteEmployee(employeeId);
        return ApiResponse.success("Employee deleted successfully", null);
    }

    @DeleteMapping("/departments/{departmentId}/employees/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<EmployeeResponse> removeEmployeeFromDepartment(
            @PathVariable UUID departmentId,
            @PathVariable UUID employeeId
    ) {
        return ApiResponse.success(
                "Employee removed from department successfully",
                hrDirectoryService.removeEmployeeFromDepartment(departmentId, employeeId)
        );
    }

    @GetMapping("/departments")
    public ApiResponse<List<DepartmentResponse>> getDepartments() {
        return ApiResponse.success("Departments loaded successfully", hrDirectoryService.getDepartments());
    }

    @PostMapping("/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        return ApiResponse.created("Department created successfully", hrDirectoryService.createDepartment(request));
    }

    @PutMapping("/departments/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<DepartmentResponse> updateDepartment(
            @PathVariable UUID departmentId,
            @Valid @RequestBody DepartmentCreateRequest request
    ) {
        return ApiResponse.success(
                "Department updated successfully",
                hrDirectoryService.updateDepartment(departmentId, request)
        );
    }

    @DeleteMapping("/departments/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
    public ApiResponse<Void> deleteDepartment(@PathVariable UUID departmentId) {
        hrDirectoryService.deleteDepartment(departmentId);
        return ApiResponse.success("Department deleted successfully", null);
    }
}
