package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.ErrorCode;
import com.scms.common.response.PagedResponse;
import com.scms.employee.entity.Employee;
import com.scms.employee.entity.EmployeeStatus;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.hr.dto.request.AssignRolesRequest;
import com.scms.hr.dto.request.CreateUserAccountRequest;
import com.scms.hr.dto.request.ResetPasswordRequest;
import com.scms.hr.dto.request.UpdateUserStatusRequest;
import com.scms.hr.dto.response.EmployeeAccountOptionResponse;
import com.scms.hr.dto.response.UserAccountResponse;
import com.scms.hr.entity.HrAuditAction;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.entity.EmployeeRole;
import com.scms.user.entity.Role;
import com.scms.user.repository.EmployeeRoleRepository;
import com.scms.user.repository.RoleRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAccountService {

    static int MAX_PAGE_SIZE = 200;
    static String ADMIN_ROLE_CODE = "ADMIN";

    UserRepository userRepository;
    EmployeeRepository employeeRepository;
    EmployeeRoleRepository employeeRoleRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    HrAuditService hrAuditService;

    /**
     * Danh sách tài khoản có phân trang và bộ lọc.
     * Tài khoản quản trị hệ thống không hiển thị ở màn hình nhân sự.
     *
     * @param status {@code all} | {@code active} | {@code locked}
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserAccountResponse> getAccounts(
            String search,
            String status,
            UUID departmentId,
            String roleCode,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                normalizePageSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<User> result = userRepository.findAll(
                accountSpecification(search, status, departmentId, roleCode),
                pageable
        );
        Map<UUID, List<RoleResponse>> rolesByEmployee = loadRoles(result.getContent());

        List<UserAccountResponse> content = result.getContent().stream()
                .map(user -> toUserAccountResponse(user, rolesByEmployee))
                .toList();

        return PagedResponse.<UserAccountResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    /**
     * Nhân viên đủ điều kiện được cấp tài khoản: chưa có tài khoản và chưa nghỉ việc.
     */
    @Transactional(readOnly = true)
    public List<EmployeeAccountOptionResponse> getEmployeesWithoutAccount() {
        return employeeRepository.findEmployeesWithoutAccount().stream()
                .filter(employee -> !isResigned(employee))
                .map(this::toEmployeeAccountOptionResponse)
                .toList();
    }

    /**
     * Các vai trò nhân sự được phép cấp cho nhân viên (không gồm quản trị hệ thống).
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getAssignableRoles() {
        return roleRepository.findAll().stream()
                .filter(role -> !ADMIN_ROLE_CODE.equalsIgnoreCase(role.getRoleCode()))
                .sorted((left, right) -> left.getRoleName().compareToIgnoreCase(right.getRoleName()))
                .map(this::toRoleResponse)
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

        if (isResigned(employee)) {
            throw new BadRequestException("Không thể cấp tài khoản cho nhân viên đã nghỉ việc.");
        }

        User user;
        if (employeeAccount.isPresent()) {
            // Nhân viên từng có tài khoản bị xóa mềm: kích hoạt lại chính bản ghi cũ.
            user = employeeAccount.get();
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setIsActive(true);
            user.setDeleted(false);
        } else {
            user = User.builder()
                    .username(username)
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .employee(employee)
                    .isActive(true)
                    .deleted(false)
                    .build();
        }

        user = userRepository.save(user);
        replaceRoles(employee, request.getRoleIds());

        Map<UUID, List<RoleResponse>> roles = loadRoles(List.of(user));
        hrAuditService.record(
                HrAuditAction.CREATE_ACCOUNT,
                user.getUserId(),
                user.getUsername(),
                "Cấp cho nhân viên " + employee.getName() + ". Vai trò: " + describeRoles(roles, employee)
        );

        return toUserAccountResponse(user, roles);
    }

    /**
     * Đặt lại mật khẩu giúp nhân viên quên mật khẩu. Nhân sự tự chọn mật khẩu tạm rồi báo lại
     * cho nhân viên; mật khẩu không xuất hiện trong nhật ký hay log ứng dụng.
     */
    public UserAccountResponse resetPassword(UUID userId, ResetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new BadRequestException("Tài khoản đã bị xóa nên không thể đặt lại mật khẩu.");
        }

        if (user.getEmployee() != null) {
            assertNotSystemAdmin(user.getEmployee(), "Không thể đặt lại mật khẩu của tài khoản quản trị hệ thống.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);

        hrAuditService.record(
                HrAuditAction.RESET_PASSWORD,
                savedUser.getUserId(),
                savedUser.getUsername(),
                "Nhân sự đặt lại mật khẩu tạm cho tài khoản"
        );

        return toUserAccountResponse(savedUser, loadRoles(List.of(savedUser)));
    }

    /**
     * Cập nhật vai trò của tài khoản. Vai trò cũ bị thay thế hoàn toàn bằng danh sách mới.
     */
    public UserAccountResponse updateAccountRoles(UUID userId, AssignRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));
        Employee employee = requireEmployee(user);

        assertNotSystemAdmin(employee, "Không thể thay đổi vai trò của tài khoản quản trị hệ thống.");
        replaceRoles(employee, request.getRoleIds());

        Map<UUID, List<RoleResponse>> roles = loadRoles(List.of(user));
        hrAuditService.record(
                HrAuditAction.UPDATE_ROLES,
                user.getUserId(),
                user.getUsername(),
                "Vai trò mới: " + describeRoles(roles, employee)
        );

        return toUserAccountResponse(user, roles);
    }

    public UserAccountResponse updateAccountStatus(UUID userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        if (user.getEmployee() != null) {
            assertNotSystemAdmin(user.getEmployee(), "Không thể khóa tài khoản quản trị hệ thống.");
        }

        user.setIsActive(request.getActive());
        User savedUser = userRepository.save(user);

        boolean unlocking = Boolean.TRUE.equals(request.getActive());
        hrAuditService.record(
                unlocking ? HrAuditAction.UNLOCK_ACCOUNT : HrAuditAction.LOCK_ACCOUNT,
                savedUser.getUserId(),
                savedUser.getUsername(),
                unlocking ? "Tài khoản được mở khóa, đăng nhập lại được" : "Tài khoản bị khóa, không đăng nhập được"
        );

        return toUserAccountResponse(savedUser, loadRoles(List.of(savedUser)));
    }

    public UserAccountResponse deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ACCOUNT_NOT_FOUND));

        if (user.getEmployee() != null) {
            assertNotSystemAdmin(user.getEmployee(), "Không thể xóa tài khoản quản trị hệ thống.");
        }

        user.setIsActive(false);
        user.setDeleted(true);
        User savedUser = userRepository.save(user);

        hrAuditService.record(
                HrAuditAction.DELETE_ACCOUNT,
                savedUser.getUserId(),
                savedUser.getUsername(),
                "Xóa mềm tài khoản, dữ liệu vẫn được giữ trong hệ thống"
        );

        return toUserAccountResponse(savedUser, loadRoles(List.of(savedUser)));
    }

    // ── Nội bộ ───────────────────────────────────────────────────────────────

    private Specification<User> accountSpecification(
            String search,
            String status,
            UUID departmentId,
            String roleCode
    ) {
        String keyword = StringUtils.hasText(search) ? search.trim().toLowerCase() : null;

        return (root, query, builder) -> {
            // employee là quan hệ bắt buộc của User nên có thể đi thẳng qua đường dẫn.
            // Dữ liệu department/position được nạp kèm qua @EntityGraph ở repository.
            Join<User, Employee> employee = root.join("employee", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.isFalse(root.get("deleted")));
            predicates.add(builder.not(hasRole(query, builder, employee, ADMIN_ROLE_CODE)));

            if (keyword != null) {
                String pattern = "%" + keyword + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("username")), pattern),
                        builder.like(builder.lower(builder.coalesce(employee.get("name"), "")), pattern),
                        builder.like(builder.lower(builder.coalesce(employee.get("phone"), "")), pattern)
                ));
            }

            if (StringUtils.hasText(status) && !"all".equalsIgnoreCase(status)) {
                boolean active = switch (status.toLowerCase()) {
                    case "active" -> true;
                    case "locked" -> false;
                    default -> throw new BadRequestException("Bộ lọc trạng thái không hợp lệ: " + status);
                };
                predicates.add(builder.equal(root.get("isActive"), active));
            }

            if (departmentId != null) {
                predicates.add(builder.equal(
                        employee.get("department").get("departmentId"),
                        departmentId
                ));
            }

            if (StringUtils.hasText(roleCode)) {
                predicates.add(hasRole(query, builder, employee, roleCode.trim()));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Điều kiện "nhân viên của tài khoản này đang giữ vai trò roleCode".
     */
    private Predicate hasRole(
            CriteriaQuery<?> query,
            CriteriaBuilder builder,
            Join<User, Employee> employee,
            String roleCode
    ) {
        Subquery<Integer> roleQuery = query.subquery(Integer.class);
        Root<EmployeeRole> employeeRole = roleQuery.from(EmployeeRole.class);
        roleQuery.select(builder.literal(1)).where(
                builder.equal(
                        employeeRole.get("employee").get("employeeId"),
                        employee.get("employeeId")
                ),
                builder.equal(
                        builder.upper(employeeRole.get("role").get("roleCode")),
                        roleCode.toUpperCase()
                )
        );

        return builder.exists(roleQuery);
    }

    /**
     * Nạp vai trò của tất cả tài khoản trong trang bằng một truy vấn duy nhất.
     */
    private Map<UUID, List<RoleResponse>> loadRoles(List<User> users) {
        List<UUID> employeeIds = users.stream()
                .map(User::getEmployee)
                .filter(java.util.Objects::nonNull)
                .map(Employee::getEmployeeId)
                .toList();

        if (employeeIds.isEmpty()) {
            return Map.of();
        }

        Map<UUID, List<RoleResponse>> rolesByEmployee = new HashMap<>();
        for (EmployeeRole employeeRole : employeeRoleRepository.findByEmployeeIds(employeeIds)) {
            rolesByEmployee
                    .computeIfAbsent(employeeRole.getEmployee().getEmployeeId(), key -> new ArrayList<>())
                    .add(toRoleResponse(employeeRole.getRole()));
        }

        return rolesByEmployee;
    }

    private void replaceRoles(Employee employee, List<UUID> roleIds) {
        if (roleIds == null) {
            return;
        }

        employeeRoleRepository.deleteByEmployeeEmployeeId(employee.getEmployeeId());

        // LinkedHashSet để bỏ trùng mà vẫn giữ nguyên thứ tự người dùng chọn.
        for (UUID roleId : new LinkedHashSet<>(roleIds)) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            if (ADMIN_ROLE_CODE.equalsIgnoreCase(role.getRoleCode())) {
                throw new BadRequestException("Không thể cấp vai trò quản trị hệ thống từ màn hình nhân sự.");
            }

            employeeRoleRepository.save(EmployeeRole.builder()
                    .employee(employee)
                    .role(role)
                    .build());
        }
    }

    private boolean isResigned(Employee employee) {
        return EmployeeStatus.RESIGNED.getLabel().equals(employee.getStatus());
    }

    /** Danh sách vai trò dạng chuỗi để ghi vào nhật ký. */
    private String describeRoles(Map<UUID, List<RoleResponse>> rolesByEmployee, Employee employee) {
        List<RoleResponse> roles = rolesByEmployee.getOrDefault(employee.getEmployeeId(), List.of());

        return roles.isEmpty()
                ? "chưa phân quyền"
                : roles.stream().map(RoleResponse::getRoleName).collect(Collectors.joining(", "));
    }

    private Employee requireEmployee(User user) {
        if (user.getEmployee() == null) {
            throw new BadRequestException("Tài khoản chưa gắn với nhân viên nào nên không thể phân quyền.");
        }

        return user.getEmployee();
    }

    private void assertNotSystemAdmin(Employee employee, String message) {
        boolean isAdmin = employeeRoleRepository.findByEmployee(employee).stream()
                .anyMatch(employeeRole -> ADMIN_ROLE_CODE.equalsIgnoreCase(employeeRole.getRole().getRoleCode()));

        if (isAdmin) {
            throw new BadRequestException(message);
        }
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }

        return Math.min(size, MAX_PAGE_SIZE);
    }

    private RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder()
                .roleId(role.getRoleId().toString())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .build();
    }

    private UserAccountResponse toUserAccountResponse(
            User user,
            Map<UUID, List<RoleResponse>> rolesByEmployee
    ) {
        Employee employee = user.getEmployee();
        List<RoleResponse> roles = employee != null
                ? rolesByEmployee.getOrDefault(employee.getEmployeeId(), List.of())
                : List.of();

        return UserAccountResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .active(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .employeeId(employee != null ? employee.getEmployeeId() : null)
                .employeeCode(employee != null ? employee.getEmployeeCode() : null)
                .employeeName(employee != null ? employee.getName() : null)
                .phone(employee != null ? employee.getPhone() : null)
                .departmentId(employee != null && employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentId()
                        : null)
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
                .employeeCode(employee.getEmployeeCode())
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
