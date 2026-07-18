package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeePositionRepository;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.hr.dto.request.DepartmentCreateRequest;
import com.scms.hr.dto.response.DepartmentResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrDirectoryServiceTest {

    @Mock
    EmployeeRepository employeeRepository;

    @Mock
    EmployeePositionRepository employeePositionRepository;

    @Mock
    DepartmentRepository departmentRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    HrDirectoryService service;

    @Test
    void updateDepartmentKeepsEmployeeCount() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder()
                .departmentId(departmentId)
                .departmentCode("NS")
                .departmentName("Nhân sự")
                .build();
        DepartmentCreateRequest request = new DepartmentCreateRequest();
        request.setDepartmentCode("HCNS");
        request.setDepartmentName("Phòng hành chính nhân sự");

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(departmentRepository.findByDepartmentCode("HCNS")).thenReturn(Optional.empty());
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.countByDepartmentDepartmentId(departmentId)).thenReturn(3L);

        DepartmentResponse response = service.updateDepartment(departmentId, request);

        assertThat(response.getDepartmentCode()).isEqualTo("HCNS");
        assertThat(response.getDepartmentName()).isEqualTo("Phòng hành chính nhân sự");
        assertThat(response.getEmployeeCount()).isEqualTo(3L);
    }

    @Test
    void deleteDepartmentRejectsDepartmentWithEmployees() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.existsByDepartmentDepartmentId(departmentId)).thenReturn(true);

        assertThatThrownBy(() -> service.deleteDepartment(departmentId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("vẫn còn nhân viên");
        verify(departmentRepository, never()).delete(any(Department.class));
    }

    @Test
    void deleteEmployeeDeactivatesAccountBeforeSoftDelete() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).build();
        User account = User.builder().isActive(true).deleted(false).build();

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.of(account));

        service.deleteEmployee(employeeId);

        assertThat(account.getIsActive()).isFalse();
        assertThat(account.getDeleted()).isTrue();
        verify(userRepository).save(account);
        verify(employeeRepository).delete(employee);
    }

    @Test
    void deleteEmployeeSoftDeletesEmployeeWithoutActiveAccount() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).build();

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.empty());

        service.deleteEmployee(employeeId);

        verify(employeeRepository).delete(employee);
    }

    @Test
    void removeEmployeeFromDepartmentOnlyClearsDepartmentLink() {
        UUID departmentId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .name("Nguyễn Văn A")
                .department(department)
                .build();

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.empty());

        service.removeEmployeeFromDepartment(departmentId, employeeId);

        assertThat(employee.getDepartment()).isNull();
        verify(employeeRepository).save(employee);
        verify(employeeRepository, never()).delete(any(Employee.class));
    }
}
