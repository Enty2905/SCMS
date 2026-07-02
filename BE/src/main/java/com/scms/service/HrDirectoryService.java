package com.scms.service;

import com.scms.dto.response.DepartmentResponse;
import com.scms.dto.response.EmployeeResponse;
import com.scms.entity.Department;
import com.scms.entity.Employee;
import com.scms.repository.DepartmentRepository;
import com.scms.repository.EmployeeRepository;
import com.scms.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HrDirectoryService {

    EmployeeRepository employeeRepository;
    DepartmentRepository departmentRepository;
    UserRepository userRepository;

    public List<EmployeeResponse> getEmployees() {
        AtomicInteger index = new AtomicInteger(1);

        return employeeRepository.findAllWithDetails().stream()
                .map(employee -> toEmployeeResponse(employee, index.getAndIncrement()))
                .toList();
    }

    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findDepartmentsWithEmployeeCount().stream()
                .map(this::toDepartmentResponse)
                .toList();
    }

    private EmployeeResponse toEmployeeResponse(Employee employee, int index) {
        boolean hasAccount = userRepository.existsByEmployeeEmployeeId(employee.getEmployeeId());
        String employeeCode = "NV" + String.format("%03d", index);
        String emailName = employee.getName() == null
                ? "nhanvien"
                : employee.getName()
                        .toLowerCase()
                        .replaceAll("[^a-z0-9\\s]", "")
                        .replaceAll("\\s+", "");

        return EmployeeResponse.builder()
                .employeeId(employee.getEmployeeId())
                .employeeCode(employeeCode)
                .employeeName(employee.getName())
                .phone(employee.getPhone())
                .email(emailName + "@nhm.vn")
                .gender(null)
                .departmentName(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : null)
                .departmentCode(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentCode()
                        : null)
                .positionName(employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee.getWorkLocation())
                .status("Đang làm việc")
                .hasAccount(hasAccount)
                .build();
    }

    private DepartmentResponse toDepartmentResponse(Object[] row) {
        Department department = (Department) row[0];
        Long employeeCount = (Long) row[1];

        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .employeeCount(employeeCount)
                .build();
    }
}
