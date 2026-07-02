package com.scms.hr.service;

import com.scms.auth.repository.UserRepository;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.hr.dto.response.DepartmentResponse;
import com.scms.hr.dto.response.EmployeeResponse;
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
                .departmentCode(null)
                .positionName(employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee.getWorkLocation())
                .status("Dang lam viec")
                .hasAccount(hasAccount)
                .build();
    }

    private DepartmentResponse toDepartmentResponse(Object[] row) {
        Department department = (Department) row[0];
        Long employeeCount = (Long) row[1];

        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(null)
                .departmentName(department.getDepartmentName())
                .employeeCount(employeeCount)
                .build();
    }
}
