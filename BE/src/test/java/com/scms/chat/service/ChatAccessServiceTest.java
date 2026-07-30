package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.employee.entity.Employee;
import com.scms.user.entity.EmployeeRole;
import com.scms.user.entity.Role;
import com.scms.user.repository.EmployeeRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatAccessServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    DepartmentRepository departmentRepository;

    @Mock
    EmployeeRoleRepository employeeRoleRepository;

    @InjectMocks
    ChatAccessService service;

    @Test
    void regularUserCanOnlyAccessOwnDepartment() {
        Department ownDepartment = department("Nhân sự");
        User user = activeUser("hr", ownDepartment);
        when(userRepository.findByUsernameWithDetails("hr")).thenReturn(Optional.of(user));
        when(employeeRoleRepository.findByEmployeeId(user.getEmployee().getEmployeeId()))
                .thenReturn(List.of());

        assertThat(service.requireRoomAccess("hr", ownDepartment.getDepartmentId()))
                .isSameAs(user);
        assertThatThrownBy(() -> service.requireRoomAccess("hr", UUID.randomUUID()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void administratorCanAccessEveryExistingDepartment() {
        Department ownDepartment = department("Ban giám đốc");
        Department targetDepartment = department("Phân xưởng sửa chữa");
        User admin = activeUser("admin", ownDepartment);
        Role adminRole = Role.builder().roleCode("ADMIN").build();
        EmployeeRole assignment = EmployeeRole.builder()
                .employee(admin.getEmployee())
                .role(adminRole)
                .build();

        when(userRepository.findByUsernameWithDetails("admin")).thenReturn(Optional.of(admin));
        when(employeeRoleRepository.findByEmployeeId(admin.getEmployee().getEmployeeId()))
                .thenReturn(List.of(assignment));
        when(departmentRepository.findById(targetDepartment.getDepartmentId()))
                .thenReturn(Optional.of(targetDepartment));

        assertThat(service.requireRoomAccess("admin", targetDepartment.getDepartmentId()))
                .isSameAs(admin);
    }

    @Test
    void administratorWithoutDepartmentCanAccessEveryExistingDepartment() {
        Department targetDepartment = department("Phân xưởng sửa chữa");
        User admin = activeUser("admin", null);
        Role adminRole = Role.builder().roleCode("ADMIN").build();
        EmployeeRole assignment = EmployeeRole.builder()
                .employee(admin.getEmployee())
                .role(adminRole)
                .build();

        when(userRepository.findByUsernameWithDetails("admin")).thenReturn(Optional.of(admin));
        when(employeeRoleRepository.findByEmployeeId(admin.getEmployee().getEmployeeId()))
                .thenReturn(List.of(assignment));
        when(departmentRepository.findById(targetDepartment.getDepartmentId()))
                .thenReturn(Optional.of(targetDepartment));

        assertThat(service.requireRoomAccess("admin", targetDepartment.getDepartmentId()))
                .isSameAs(admin);
    }

    @Test
    void lockedAccountCannotOpenChat() {
        User user = activeUser("locked", department("Nhân sự"));
        user.setIsActive(false);
        when(userRepository.findByUsernameWithDetails("locked")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.requireActiveUser("locked"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("khóa");
    }

    private static Department department(String name) {
        return Department.builder()
                .departmentId(UUID.randomUUID())
                .departmentName(name)
                .build();
    }

    private static User activeUser(String username, Department department) {
        Employee employee = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name(username)
                .department(department)
                .build();
        return User.builder()
                .userId(UUID.randomUUID())
                .username(username)
                .employee(employee)
                .isActive(true)
                .deleted(false)
                .build();
    }
}
