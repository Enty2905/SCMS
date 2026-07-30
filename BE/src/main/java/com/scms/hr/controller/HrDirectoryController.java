package com.scms.hr.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.employee.entity.EmployeeStatus;
import com.scms.employee.entity.Gender;
import com.scms.hr.dto.request.DepartmentCreateRequest;
import com.scms.hr.dto.request.EmployeeUpsertRequest;
import com.scms.hr.dto.response.DepartmentResponse;
import com.scms.hr.dto.response.EmployeeOptionsResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU', 'REPAIR_MANAGER', 'TEAM_LEADER', 'WAREHOUSE_TOOL')")
    public ApiResponse<List<EmployeeResponse>> getEmployees() {
        return ApiResponse.success("Employees loaded successfully", hrDirectoryService.getEmployees());
    }

    /**
     * Tìm kiếm nhân viên có phân trang: theo từ khóa, phòng ban và tình trạng tài khoản.
     */
    @GetMapping("/employees/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU', 'REPAIR_MANAGER', 'TEAM_LEADER', 'WAREHOUSE_TOOL')")
    public ApiResponse<PagedResponse<EmployeeResponse>> searchEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "all") String accountState,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
                "Employees loaded successfully",
                hrDirectoryService.searchEmployees(search, departmentId, status, accountState, page, size)
        );
    }

    /**
     * Các giá trị hợp lệ của giới tính và tình trạng làm việc, để giao diện không phải
     * khai báo cứng danh sách này ở phía client.
     */
    @GetMapping("/employee-options")
    public ApiResponse<EmployeeOptionsResponse> getEmployeeOptions() {
        return ApiResponse.success(
                "Employee options loaded successfully",
                EmployeeOptionsResponse.builder()
                        .genders(Gender.labels())
                        .statuses(EmployeeStatus.labels())
                        .build()
        );
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

    /**
     * Danh sách nhân viên của một phòng ban, kèm tìm kiếm trong nội bộ phòng ban.
     */
    @GetMapping("/departments/{departmentId}/employees")
    public ApiResponse<List<EmployeeResponse>> getDepartmentEmployees(
            @PathVariable UUID departmentId,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(
                "Department employees loaded successfully",
                hrDirectoryService.getDepartmentEmployees(departmentId, search)
        );
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
    public ApiResponse<List<DepartmentResponse>> getDepartments(
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success("Departments loaded successfully", hrDirectoryService.getDepartments(search));
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
