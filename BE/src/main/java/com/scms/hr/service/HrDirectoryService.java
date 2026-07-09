package com.scms.hr.service;

import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.DuplicateResourceException;
import com.scms.common.exception.NotFoundException;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.employee.entity.Employee;
import com.scms.employee.entity.EmployeePosition;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.employee.repository.EmployeePositionRepository;
import com.scms.hr.dto.request.DepartmentCreateRequest;
import com.scms.hr.dto.request.EmployeeUpsertRequest;
import com.scms.hr.dto.response.DepartmentResponse;
import com.scms.hr.dto.response.EmployeePositionResponse;
import com.scms.hr.dto.response.EmployeeResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HrDirectoryService {

    EmployeeRepository employeeRepository;
    EmployeePositionRepository employeePositionRepository;
    DepartmentRepository departmentRepository;
    UserRepository userRepository;

    @NonFinal
    @Value("${app.upload.employee-avatar-dir:uploads/employees}")
    String employeeAvatarDir;

    public List<EmployeeResponse> getEmployees() {
        AtomicInteger index = new AtomicInteger(1);

        return employeeRepository.findAllWithDetails().stream()
                .map(employee -> toEmployeeResponse(employee, index.getAndIncrement()))
                .toList();
    }

    public List<EmployeePositionResponse> getEmployeePositions() {
        return employeePositionRepository.findAll().stream()
                .map(position -> EmployeePositionResponse.builder()
                        .positionId(position.getPositionId())
                        .positionName(position.getPositionName())
                        .description(position.getDescription())
                        .build())
                .toList();
    }

    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findDepartmentsWithEmployeeCount().stream()
                .map(this::toDepartmentResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        String departmentCode = blankToNull(request.getDepartmentCode());
        if (departmentCode != null && departmentRepository.findByDepartmentCode(departmentCode).isPresent()) {
            throw new DuplicateResourceException("Department", "departmentCode", departmentCode);
        }

        Department department = Department.builder()
                .departmentName(request.getDepartmentName().trim())
                .departmentCode(departmentCode)
                .build();
        Department savedDepartment = departmentRepository.save(department);

        return DepartmentResponse.builder()
                .departmentId(savedDepartment.getDepartmentId())
                .departmentCode(savedDepartment.getDepartmentCode())
                .departmentName(savedDepartment.getDepartmentName())
                .employeeCount(0L)
                .build();
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeUpsertRequest request) {
        Employee employee = Employee.builder().build();
        applyEmployeeRequest(employee, request);
        Employee savedEmployee = employeeRepository.save(employee);

        return toEmployeeResponse(savedEmployee, 0);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, EmployeeUpsertRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee", "employeeId", employeeId));

        applyEmployeeRequest(employee, request);
        Employee savedEmployee = employeeRepository.save(employee);

        return toEmployeeResponse(savedEmployee, 0);
    }

    @Transactional
    public void deleteDepartment(UUID departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new NotFoundException("Department", "departmentId", departmentId);
        }

        employeeRepository.clearDepartment(departmentId);
        departmentRepository.deleteById(departmentId);
    }

    private void applyEmployeeRequest(Employee employee, EmployeeUpsertRequest request) {
        employee.setName(request.getEmployeeName().trim());
        employee.setPhone(blankToNull(request.getPhone()));
        employee.setWorkLocation(blankToNull(request.getWorkLocation()));
        employee.setDepartment(resolveDepartment(request.getDepartmentId()));
        employee.setPosition(resolvePosition(request.getPositionId()));

        String avatarUrl = storeAvatar(request.getAvatar());
        if (avatarUrl != null) {
            employee.setAvatarUrl(avatarUrl);
        }
    }

    private Department resolveDepartment(UUID departmentId) {
        if (departmentId == null) {
            return null;
        }

        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new NotFoundException("Department", "departmentId", departmentId));
    }

    private EmployeePosition resolvePosition(UUID positionId) {
        if (positionId == null) {
            return null;
        }

        return employeePositionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException("EmployeePosition", "positionId", positionId));
    }

    private String storeAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            return null;
        }

        String contentType = avatar.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File avatar phai la hinh anh");
        }

        try {
            Path uploadPath = Paths.get(employeeAvatarDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFileName = StringUtils.cleanPath(
                    avatar.getOriginalFilename() == null ? "avatar" : avatar.getOriginalFilename());
            String extension = "";
            int lastDot = originalFileName.lastIndexOf('.');
            if (lastDot >= 0) {
                extension = originalFileName.substring(lastDot);
            }

            String fileName = "employee_" + UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(fileName).toAbsolutePath().normalize();
            if (!targetPath.startsWith(uploadPath)) {
                throw new IllegalArgumentException("Invalid avatar file path");
            }

            avatar.transferTo(targetPath);
            return "/uploads/employees/" + fileName;
        } catch (IOException exception) {
            throw new IllegalArgumentException("Khong the luu anh nhan vien");
        }
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private EmployeeResponse toEmployeeResponse(Employee employee, int index) {
        boolean hasAccount = userRepository.findByEmployeeEmployeeId(employee.getEmployeeId())
                .map(user -> !Boolean.TRUE.equals(user.getDeleted()))
                .orElse(false);
        String employeeCode = index > 0 ? "NV" + String.format("%03d", index) : null;
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
                .departmentId(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentId()
                        : null)
                .departmentName(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : null)
                .departmentCode(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentCode()
                        : null)
                .positionId(employee.getPosition() != null
                        ? employee.getPosition().getPositionId()
                        : null)
                .positionName(employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee.getWorkLocation())
                .avatarUrl(employee.getAvatarUrl())
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
