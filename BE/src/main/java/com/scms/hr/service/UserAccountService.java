package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.hr.dto.request.CreateUserAccountRequest;
import com.scms.hr.dto.request.UpdateUserStatusRequest;
import com.scms.hr.dto.response.EmployeeAccountOptionResponse;
import com.scms.hr.dto.response.UserAccountResponse;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.repository.EmployeeRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAccountService {

    UserRepository userRepository;
    EmployeeRepository employeeRepository;
    EmployeeRoleRepository employeeRoleRepository;
    PasswordEncoder passwordEncoder;

    public List<UserAccountResponse> getAccounts() {
        return userRepository.findAllWithEmployeeDetails().stream()
                .filter(user -> !Boolean.TRUE.equals(user.getDeleted()))
                .map(this::toUserAccountResponse)
                .filter(account -> account.getRoles().stream()
                        .noneMatch(role -> "ADMIN".equalsIgnoreCase(role.getRoleCode())))
                .toList();
    }

    public List<EmployeeAccountOptionResponse> getEmployeesWithoutAccount() {
        return employeeRepository.findEmployeesWithoutAccount().stream()
                .map(this::toEmployeeAccountOptionResponse)
                .toList();
    }

    public UserAccountResponse createAccount(CreateUserAccountRequest request) {
        String username = request.getUsername().trim();
        Optional<User> usernameOwner = userRepository.findByUsername(username);
        Optional<User> employeeAccount = userRepository.findByEmployeeEmployeeId(request.getEmployeeId());

        if (usernameOwner.isPresent()
                && (employeeAccount.isEmpty()
                || !usernameOwner.get().getUserId().equals(employeeAccount.get().getUserId()))) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (employeeAccount.isPresent() && !Boolean.TRUE.equals(employeeAccount.get().getDeleted())) {
            throw new AppException(ErrorCode.EMPLOYEE_ALREADY_HAS_ACCOUNT);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        if (employeeAccount.isPresent()) {
            User user = employeeAccount.get();
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setIsActive(true);
            user.setDeleted(false);
            return toUserAccountResponse(userRepository.save(user));
        }

        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .employee(employee)
                .isActive(true)
                .deleted(false)
                .build();

        return toUserAccountResponse(userRepository.save(user));
    }

    public UserAccountResponse updateAccountStatus(UUID userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        user.setIsActive(request.getActive());
        return toUserAccountResponse(userRepository.save(user));
    }

    public UserAccountResponse deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        user.setIsActive(false);
        user.setDeleted(true);
        return toUserAccountResponse(userRepository.save(user));
    }

    private UserAccountResponse toUserAccountResponse(User user) {
        Employee employee = user.getEmployee();
        List<RoleResponse> roles = employee != null
                ? employeeRoleRepository.findByEmployee(employee).stream()
                        .map(employeeRole -> RoleResponse.builder()
                                .roleId(employeeRole.getRole().getRoleId().toString())
                                .roleCode(employeeRole.getRole().getRoleCode())
                                .roleName(employeeRole.getRole().getRoleName())
                                .description(employeeRole.getRole().getDescription())
                                .build())
                        .toList()
                : List.of();

        return UserAccountResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .active(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .employeeId(employee != null ? employee.getEmployeeId() : null)
                .employeeName(employee != null ? employee.getName() : null)
                .phone(employee != null ? employee.getPhone() : null)
                .departmentName(employee != null && employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : null)
                .positionName(employee != null && employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee != null ? employee.getWorkLocation() : null)
                .roles(roles)
                .build();
    }

    private EmployeeAccountOptionResponse toEmployeeAccountOptionResponse(Employee employee) {
        return EmployeeAccountOptionResponse.builder()
                .employeeId(employee.getEmployeeId())
                .employeeName(employee.getName())
                .phone(employee.getPhone())
                .departmentName(employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : null)
                .positionName(employee.getPosition() != null
                        ? employee.getPosition().getPositionName()
                        : null)
                .workLocation(employee.getWorkLocation())
                .build();
    }
}
