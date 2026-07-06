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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAccountService {

    UserRepository userRepository;
    EmployeeRepository employeeRepository;
    PasswordEncoder passwordEncoder;

    public List<UserAccountResponse> getAccounts() {
        return userRepository.findAllWithEmployeeDetails().stream()
                .map(this::toUserAccountResponse)
                .toList();
    }

    public List<EmployeeAccountOptionResponse> getEmployeesWithoutAccount() {
        return employeeRepository.findEmployeesWithoutAccount().stream()
                .map(this::toEmployeeAccountOptionResponse)
                .toList();
    }

    public UserAccountResponse createAccount(CreateUserAccountRequest request) {
        String username = request.getUsername().trim();

        if (userRepository.existsByUsername(username)) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (userRepository.existsByEmployeeEmployeeId(request.getEmployeeId())) {
            throw new AppException(ErrorCode.EMPLOYEE_ALREADY_HAS_ACCOUNT);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .employee(employee)
                .isActive(true)
                .build();

        return toUserAccountResponse(userRepository.save(user));
    }

    public UserAccountResponse updateAccountStatus(UUID userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        user.setIsActive(request.getActive());
        return toUserAccountResponse(userRepository.save(user));
    }

    public void deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        userRepository.delete(user);
    }

    private UserAccountResponse toUserAccountResponse(User user) {
        Employee employee = user.getEmployee();

        return UserAccountResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .active(user.getIsActive())
                .createdAt(user.getCreatedAt())
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
