package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.BadRequestException;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.hr.dto.request.AssignRolesRequest;
import com.scms.hr.dto.request.CreateUserAccountRequest;
import com.scms.hr.dto.request.ResetPasswordRequest;
import com.scms.hr.dto.request.UpdateUserStatusRequest;
import com.scms.hr.dto.response.UserAccountResponse;
import com.scms.hr.entity.HrAuditAction;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.entity.EmployeeRole;
import com.scms.user.entity.Role;
import com.scms.user.repository.EmployeeRoleRepository;
import com.scms.user.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAccountServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    EmployeeRepository employeeRepository;

    @Mock
    EmployeeRoleRepository employeeRoleRepository;

    @Mock
    RoleRepository roleRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    HrAuditService hrAuditService;

    @InjectMocks
    UserAccountService service;

    @Test
    void resetPasswordReplacesStoredHash() {
        UUID userId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(UUID.randomUUID()).build();
        User user = User.builder()
                .userId(userId)
                .username("nguyenvana")
                .passwordHash("hash-cu")
                .employee(employee)
                .deleted(false)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee)).thenReturn(List.of());
        when(passwordEncoder.encode("matkhaumoi")).thenReturn("hash-moi");
        when(userRepository.save(user)).thenReturn(user);
        when(employeeRoleRepository.findByEmployeeIds(anyCollection())).thenReturn(List.of());

        service.resetPassword(userId, ResetPasswordRequest.builder().newPassword("matkhaumoi").build());

        assertThat(user.getPasswordHash()).isEqualTo("hash-moi");
    }

    @Test
    void resetPasswordNeverLeaksTheNewPasswordIntoAuditTrail() {
        UUID userId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(UUID.randomUUID()).build();
        User user = User.builder()
                .userId(userId)
                .username("nguyenvana")
                .employee(employee)
                .deleted(false)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee)).thenReturn(List.of());
        when(passwordEncoder.encode("sieubimat")).thenReturn("hash-moi");
        when(userRepository.save(user)).thenReturn(user);
        when(employeeRoleRepository.findByEmployeeIds(anyCollection())).thenReturn(List.of());

        service.resetPassword(userId, ResetPasswordRequest.builder().newPassword("sieubimat").build());

        ArgumentCaptor<String> detail = ArgumentCaptor.forClass(String.class);
        verify(hrAuditService).record(eq(HrAuditAction.RESET_PASSWORD), any(), any(), detail.capture());
        assertThat(detail.getValue()).doesNotContain("sieubimat");
    }

    @Test
    void resetPasswordRejectsSystemAdministrator() {
        UUID userId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(UUID.randomUUID()).build();
        User user = User.builder().userId(userId).employee(employee).deleted(false).build();
        Role admin = Role.builder().roleId(UUID.randomUUID()).roleCode("ADMIN").roleName("Quản trị").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee))
                .thenReturn(List.of(EmployeeRole.builder().employee(employee).role(admin).build()));

        assertThatThrownBy(() -> service.resetPassword(
                userId,
                ResetPasswordRequest.builder().newPassword("matkhaumoi").build()
        )).isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createAccountRejectsResignedEmployee() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .name("Nguyễn Văn A")
                .status("Đã nghỉ việc")
                .build();
        CreateUserAccountRequest request = CreateUserAccountRequest.builder()
                .employeeId(employeeId)
                .username("nguyenvana")
                .password("matkhau123")
                .build();

        when(userRepository.findByUsername("nguyenvana")).thenReturn(Optional.empty());
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.empty());
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> service.createAccount(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("đã nghỉ việc");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void employeesWithoutAccountExcludeResignedStaff() {
        when(employeeRepository.findEmployeesWithoutAccount()).thenReturn(List.of(
                Employee.builder().employeeId(UUID.randomUUID()).name("Đang làm").status("Đang làm việc").build(),
                Employee.builder().employeeId(UUID.randomUUID()).name("Đã nghỉ").status("Đã nghỉ việc").build()
        ));

        assertThat(service.getEmployeesWithoutAccount())
                .extracting(com.scms.hr.dto.response.EmployeeAccountOptionResponse::getEmployeeName)
                .containsExactly("Đang làm");
    }

    @Test
    void createAccountAssignsRequestedRoles() {
        UUID employeeId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).name("Nguyễn Văn A").build();
        Role role = Role.builder().roleId(roleId).roleCode("SHIFT_LEADER").roleName("Trưởng ca").build();
        CreateUserAccountRequest request = CreateUserAccountRequest.builder()
                .employeeId(employeeId)
                .username("  nguyenvana  ")
                .password("matkhau123")
                .roleIds(List.of(roleId))
                .build();

        when(userRepository.findByUsername("nguyenvana")).thenReturn(Optional.empty());
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.empty());
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(passwordEncoder.encode("matkhau123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(employeeRoleRepository.findByEmployeeIds(anyCollection()))
                .thenReturn(List.of(EmployeeRole.builder().employee(employee).role(role).build()));

        UserAccountResponse response = service.createAccount(request);

        assertThat(response.getUsername()).isEqualTo("nguyenvana");
        assertThat(response.getRoles()).extracting(RoleResponse::getRoleCode).containsExactly("SHIFT_LEADER");

        ArgumentCaptor<EmployeeRole> assigned = ArgumentCaptor.forClass(EmployeeRole.class);
        verify(employeeRoleRepository).save(assigned.capture());
        assertThat(assigned.getValue().getRole().getRoleId()).isEqualTo(roleId);
    }

    @Test
    void createAccountRejectsUsernameTakenByAnotherEmployee() {
        UUID employeeId = UUID.randomUUID();
        CreateUserAccountRequest request = CreateUserAccountRequest.builder()
                .employeeId(employeeId)
                .username("trungnv")
                .password("matkhau123")
                .build();

        when(userRepository.findByUsername("trungnv"))
                .thenReturn(Optional.of(User.builder().userId(UUID.randomUUID()).build()));
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createAccount(request)).isInstanceOf(AppException.class);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateAccountRolesReplacesPreviousRoles() {
        UUID userId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).build();
        User user = User.builder().userId(userId).employee(employee).isActive(true).build();
        Role role = Role.builder().roleId(roleId).roleCode("TEAM_LEADER").roleName("Tổ trưởng").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee)).thenReturn(List.of());
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(employeeRoleRepository.findByEmployeeIds(anyCollection()))
                .thenReturn(List.of(EmployeeRole.builder().employee(employee).role(role).build()));

        UserAccountResponse response = service.updateAccountRoles(
                userId,
                AssignRolesRequest.builder().roleIds(List.of(roleId)).build()
        );

        verify(employeeRoleRepository).deleteByEmployeeEmployeeId(employeeId);
        assertThat(response.getRoles()).extracting(RoleResponse::getRoleCode).containsExactly("TEAM_LEADER");
    }

    @Test
    void updateAccountRolesRejectsAdminRole() {
        UUID userId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).build();
        User user = User.builder().userId(userId).employee(employee).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee)).thenReturn(List.of());
        when(roleRepository.findById(roleId))
                .thenReturn(Optional.of(Role.builder().roleId(roleId).roleCode("ADMIN").roleName("Quản trị").build()));

        assertThatThrownBy(() -> service.updateAccountRoles(
                userId,
                AssignRolesRequest.builder().roleIds(List.of(roleId)).build()
        )).isInstanceOf(BadRequestException.class);
    }

    @Test
    void lockAccountRejectsSystemAdministrator() {
        UUID userId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(UUID.randomUUID()).build();
        User user = User.builder().userId(userId).employee(employee).isActive(true).build();
        Role admin = Role.builder().roleId(UUID.randomUUID()).roleCode("ADMIN").roleName("Quản trị").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployee(employee))
                .thenReturn(List.of(EmployeeRole.builder().employee(employee).role(admin).build()));

        assertThatThrownBy(() -> service.updateAccountStatus(
                userId,
                UpdateUserStatusRequest.builder().active(false).build()
        )).isInstanceOf(BadRequestException.class);

        assertThat(user.getIsActive()).isTrue();
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void assignableRolesExcludeSystemAdministrator() {
        when(roleRepository.findAll()).thenReturn(List.of(
                Role.builder().roleId(UUID.randomUUID()).roleCode("ADMIN").roleName("Quản trị hệ thống").build(),
                Role.builder().roleId(UUID.randomUUID()).roleCode("SHIFT_LEADER").roleName("Trưởng ca").build()
        ));

        assertThat(service.getAssignableRoles())
                .extracting(RoleResponse::getRoleCode)
                .containsExactly("SHIFT_LEADER");
    }
}
