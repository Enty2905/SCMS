package com.scms.hr.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.DuplicateResourceException;
import com.scms.common.service.CloudinaryService;
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
import org.springframework.mock.web.MockMultipartFile;

import com.scms.hr.dto.request.EmployeeUpsertRequest;
import com.scms.hr.dto.response.EmployeeResponse;

import java.util.List;
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

    @Mock
    CloudinaryService cloudinaryService;

    @Mock
    HrAuditService hrAuditService;

    @InjectMocks
    HrDirectoryService service;

    @Test
    void createEmployeeRejectsPhoneUsedByAnotherEmployee() {
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Nguyễn Văn A");
        request.setDepartmentId(UUID.randomUUID());
        request.setPhone("0900000004");

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(employeeRepository.findByPhoneIncludingDeleted("0900000004"))
                .thenReturn(List.<Object[]>of(new Object[]{"NV003", 0}));

        assertThatThrownBy(() -> service.createEmployee(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Số điện thoại")
                .hasMessageContaining("NV003");
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    /**
     * Driver MySQL trả cột tinyint(1) về dưới dạng Boolean chứ không phải Number.
     * Test này giữ cho việc đọc cờ is_deleted chấp nhận cả hai kiểu.
     */
    @Test
    void duplicateCheckReadsDeletedFlagAsBooleanOrNumber() {
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Nguyễn Văn A");
        request.setDepartmentId(UUID.randomUUID());
        request.setPhone("0900000004");

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(employeeRepository.findByPhoneIncludingDeleted("0900000004"))
                .thenReturn(List.<Object[]>of(new Object[]{"NV003", Boolean.TRUE}));

        assertThatThrownBy(() -> service.createEmployee(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("đã bị xóa");
    }

    @Test
    void createEmployeeExplainsWhenEmailBelongsToDeletedProfile() {
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Nguyễn Văn A");
        request.setDepartmentId(UUID.randomUUID());
        request.setEmail("cu@nhm.vn");

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(employeeRepository.findByEmailIncludingDeleted("cu@nhm.vn"))
                .thenReturn(List.<Object[]>of(new Object[]{"NV007", 1}));

        assertThatThrownBy(() -> service.createEmployee(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("đã bị xóa");
    }

    @Test
    void updateEmployeeKeepsItsOwnPhone() {
        UUID employeeId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .employeeCode("NV003")
                .name("Cũ")
                .phone("0900000004")
                .build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Tên mới");
        request.setDepartmentId(departmentId);
        request.setPhone("0900000004");

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeRepository.findByPhoneIncludingDeleted("0900000004"))
                .thenReturn(List.<Object[]>of(new Object[]{"NV003", 0}));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.updateEmployee(employeeId, request);

        assertThat(response.getEmployeeName()).isEqualTo("Tên mới");
    }

    @Test
    void updateEmployeeLocksAccountWhenStaffResigns() {
        UUID employeeId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .employeeCode("NV002")
                .name("Hoàng Nam")
                .status("Đang làm việc")
                .build();
        User account = User.builder().isActive(true).deleted(false).build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Hoàng Nam");
        request.setDepartmentId(departmentId);
        request.setStatus("Đã nghỉ việc");

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findByEmployeeEmployeeId(employeeId)).thenReturn(Optional.of(account));
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        service.updateEmployee(employeeId, request);

        assertThat(account.getIsActive()).isFalse();
        verify(userRepository).save(account);
    }

    @Test
    void updateEmployeeLeavesAccountAloneWhenStaffStaysOnLeave() {
        UUID employeeId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .employeeCode("NV002")
                .name("Hoàng Nam")
                .status("Đang làm việc")
                .build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Hoàng Nam");
        request.setDepartmentId(departmentId);
        request.setStatus("Tạm nghỉ");

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        service.updateEmployee(employeeId, request);

        verify(userRepository, never()).findByEmployeeEmployeeId(employeeId);
    }

    @Test
    void createEmployeeUploadsAvatarToSharedCloudinaryFolder() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        MockMultipartFile avatar = new MockMultipartFile(
                "avatar", "anh.png", "image/png", new byte[]{1, 2, 3});
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Nguyễn Văn A");
        request.setDepartmentId(departmentId);
        request.setAvatar(avatar);

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(cloudinaryService.uploadFile(avatar, "scms/employees"))
                .thenReturn("https://res.cloudinary.com/demo/image/upload/scms/employees/a.png");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.createEmployee(request);

        assertThat(response.getAvatarUrl())
                .isEqualTo("https://res.cloudinary.com/demo/image/upload/scms/employees/a.png");
        verify(cloudinaryService).uploadFile(avatar, "scms/employees");
    }

    @Test
    void createEmployeeStoresGenderAndStatus() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Trần Thị B");
        request.setDepartmentId(departmentId);
        request.setGender("Nữ");
        request.setStatus("Tạm nghỉ");

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.createEmployee(request);

        assertThat(response.getGender()).isEqualTo("Nữ");
        assertThat(response.getStatus()).isEqualTo("Tạm nghỉ");
    }

    @Test
    void createEmployeeDefaultsToWorkingWhenStatusOmitted() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Lê Văn C");
        request.setDepartmentId(departmentId);

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.createEmployee(request);

        assertThat(response.getStatus()).isEqualTo("Đang làm việc");
        assertThat(response.getGender()).isNull();
    }

    @Test
    void createEmployeeRejectsUnknownStatus() {
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Phạm Thị D");
        request.setDepartmentId(UUID.randomUUID());
        request.setStatus("Nghỉ hưu");

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(0);

        assertThatThrownBy(() -> service.createEmployee(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Tình trạng làm việc không hợp lệ");
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void createEmployeeAssignsNextEmployeeCode() {
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("  Nguyễn Văn A  ");
        request.setDepartmentId(departmentId);

        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(7);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.createEmployee(request);

        assertThat(response.getEmployeeCode()).isEqualTo("NV008");
        assertThat(response.getEmployeeName()).isEqualTo("Nguyễn Văn A");
        assertThat(response.getHasAccount()).isFalse();
    }

    @Test
    void updateEmployeeBackfillsMissingEmployeeCode() {
        UUID employeeId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder().employeeId(employeeId).name("Cũ").build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Trần Thị B");
        request.setDepartmentId(departmentId);

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeRepository.findMaxEmployeeCodeSequence()).thenReturn(11);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.updateEmployee(employeeId, request);

        assertThat(response.getEmployeeCode()).isEqualTo("NV012");
    }

    @Test
    void updateEmployeeKeepsExistingEmployeeCode() {
        UUID employeeId = UUID.randomUUID();
        UUID departmentId = UUID.randomUUID();
        Department department = Department.builder().departmentId(departmentId).build();
        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .employeeCode("NV003")
                .name("Cũ")
                .build();
        EmployeeUpsertRequest request = new EmployeeUpsertRequest();
        request.setEmployeeName("Trần Thị B");
        request.setDepartmentId(departmentId);

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        EmployeeResponse response = service.updateEmployee(employeeId, request);

        assertThat(response.getEmployeeCode()).isEqualTo("NV003");
        verify(employeeRepository, never()).findMaxEmployeeCodeSequence();
    }

    @Test
    void employeeResponseReportsLockedAccount() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = Employee.builder().employeeId(employeeId).name("Lê Văn C").build();

        when(employeeRepository.findAllWithDetails()).thenReturn(List.of(employee));
        when(userRepository.findAccountStatusByEmployee())
                .thenReturn(List.<Object[]>of(new Object[]{employeeId, Boolean.FALSE}));

        EmployeeResponse response = service.getEmployees().get(0);

        assertThat(response.getHasAccount()).isTrue();
        assertThat(response.getAccountActive()).isFalse();
    }

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
        request.setDescription("Quản lý nhân sự và hành chính");

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(departmentRepository.findByDepartmentCode("HCNS")).thenReturn(Optional.empty());
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.countByDepartmentDepartmentId(departmentId)).thenReturn(3L);

        DepartmentResponse response = service.updateDepartment(departmentId, request);

        assertThat(response.getDepartmentCode()).isEqualTo("HCNS");
        assertThat(response.getDepartmentName()).isEqualTo("Phòng hành chính nhân sự");
        assertThat(response.getDescription()).isEqualTo("Quản lý nhân sự và hành chính");
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
        when(userRepository.findAccountStatusByEmployee()).thenReturn(List.of());

        service.removeEmployeeFromDepartment(departmentId, employeeId);

        assertThat(employee.getDepartment()).isNull();
        verify(employeeRepository).save(employee);
        verify(employeeRepository, never()).delete(any(Employee.class));
    }
}
