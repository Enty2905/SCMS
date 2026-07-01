package com.scms.user.service;

import com.scms.user.dto.request.ChangePasswordRequest;
import com.scms.user.dto.request.ProfileUpdateRequest;
import com.scms.user.dto.request.UserCreationRequest;
import com.scms.user.dto.request.UserUpdateRequest;
import com.scms.user.dto.response.EmployeeResponse;
import com.scms.common.response.PagedResponse;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.dto.response.UserResponse;
import com.scms.employee.entity.Employee;
import com.scms.user.entity.EmployeeRole;
import com.scms.user.entity.Role;
import com.scms.auth.entity.User;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.user.repository.EmployeeRoleRepository;
import com.scms.user.repository.RoleRepository;
import com.scms.auth.repository.UserRepository;
import jakarta.annotation.Nullable;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    EmployeeRepository employeeRepository;
    EmployeeRoleRepository employeeRoleRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    // ── ADMIN/HR: Tạo tài khoản mới cho nhân viên ─────────────
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        if (userRepository.findByEmployee(employee).isPresent()) {
            throw new AppException(ErrorCode.EMPLOYEE_ALREADY_HAS_ACCOUNT);
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .employee(employee)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        if (request.getRoleCode() != null && !request.getRoleCode().isBlank()) {
            Role role = roleRepository.findByRoleCode(request.getRoleCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            employeeRoleRepository.save(EmployeeRole.builder()
                    .employee(employee)
                    .role(role)
                    .build());
        }

        log.info("Created user: {} for employee: {}", user.getUsername(), employee.getName());
        return toUserResponse(user);
    }

    // ── ADMIN/HR: Lấy danh sách user (phân trang + lọc) ───────
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    public PagedResponse<UserResponse> getUsers(
            int page,
            int size,
            @Nullable String roleCode,
            @Nullable LocalDate fromDate,
            @Nullable LocalDate toDate,
            @Nullable String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<User> spec = Specification.where(null);

        // Lọc theo role
        if (roleCode != null && !roleCode.isBlank()) {
            spec = spec.and((root, query, cb) -> {
                var employeeJoin = root.join("employee");
                var employeeRoleJoin = employeeJoin.join("employeeRoles");
                return cb.equal(
                        cb.lower(employeeRoleJoin.get("role").get("roleCode")),
                        roleCode.toLowerCase()
                );
            });
        }

        // Lọc theo ngày tạo từ
        if (fromDate != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay())
            );
        }

        // Lọc theo ngày tạo đến
        if (toDate != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(23, 59, 59))
            );
        }

        // Tìm kiếm theo username hoặc tên/sdt nhân viên
        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> {
                var emp = root.join("employee", jakarta.persistence.criteria.JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(root.get("username")), like),
                        cb.like(cb.lower(emp.get("name")), like),
                        cb.like(emp.get("phone"), like)
                );
            });
        }

        Page<User> usersPage = userRepository.findAll(spec, pageable);

        return PagedResponse.<UserResponse>builder()
                .content(usersPage.getContent().stream()
                        .map(this::toUserResponse)
                        .toList())
                .page(usersPage.getNumber())
                .size(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .last(usersPage.isLast())
                .build();
    }

    // ── ADMIN/HR: Lấy chi tiết 1 user theo ID ─────────────────
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    public UserResponse getUserById(UUID userId) {
        log.info("In method getUserById: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toUserResponse(user);
    }

    // ── All authenticated: Xem thông tin bản thân ─────────────
    public UserResponse getMyInfo() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var currentUser = (User) authentication.getPrincipal();
        log.info("Fetching info for user: {}", currentUser.getUsername());
        return toUserResponse(currentUser);
    }

    // ── ADMIN: Cập nhật trạng thái và role của user ────────────
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        if (request.getRoleCode() != null && !request.getRoleCode().isBlank()) {
            Role newRole = roleRepository.findByRoleCode(request.getRoleCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            employeeRoleRepository.deleteByEmployee(user.getEmployee());
            employeeRoleRepository.save(EmployeeRole.builder()
                    .employee(user.getEmployee())
                    .role(newRole)
                    .build());
        }

        return toUserResponse(userRepository.save(user));
    }

    // ── All authenticated: Tự cập nhật thông tin cá nhân ──────
    @Transactional
    public UserResponse updateMyProfile(ProfileUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var currentUser = (User) authentication.getPrincipal();

        Employee employee = currentUser.getEmployee();

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            employee.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            employee.setAvatarUrl(request.getAvatarUrl());
        }

        employeeRepository.save(employee);
        log.info("Profile updated for user: {}", currentUser.getUsername());
        return toUserResponse(currentUser);
    }

    // ── All authenticated: Đổi mật khẩu bản thân ──────────────
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var currentUser = (User) authentication.getPrincipal();

        if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPasswordHash())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }

        if (passwordEncoder.matches(request.getNewPassword(), currentUser.getPasswordHash())) {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        log.info("Password changed for user: {}", currentUser.getUsername());
    }

    // ── ADMIN: Soft delete – vô hiệu hóa tài khoản ────────────
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("Deactivated user: {}", user.getUsername());
    }

    // ── Helper: Map User → UserResponse ───────────────────────
    public UserResponse toUserResponse(User user) {
        List<RoleResponse> roles = employeeRoleRepository
                .findByEmployee(user.getEmployee())
                .stream()
                .map(er -> RoleResponse.builder()
                        .roleId(er.getRole().getRoleId().toString())
                        .roleCode(er.getRole().getRoleCode())
                        .roleName(er.getRole().getRoleName())
                        .description(er.getRole().getDescription())
                        .build())
                .toList();

        Employee emp = user.getEmployee();
        EmployeeResponse empResponse = EmployeeResponse.builder()
                .employeeId(emp.getEmployeeId().toString())
                .name(emp.getName())
                .phone(emp.getPhone())
                .avatarUrl(emp.getAvatarUrl())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : null)
                .positionName(emp.getPosition() != null ? emp.getPosition().getPositionName() : null)
                .workLocation(emp.getWorkLocation())
                .build();

        return UserResponse.builder()
                .userId(user.getUserId().toString())
                .username(user.getUsername())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .employee(empResponse)
                .roles(roles)
                .build();
    }
}
