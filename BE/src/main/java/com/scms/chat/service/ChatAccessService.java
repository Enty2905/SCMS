package com.scms.chat.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.department.entity.Department;
import com.scms.department.repository.DepartmentRepository;
import com.scms.user.repository.EmployeeRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatAccessService {

    UserRepository userRepository;
    DepartmentRepository departmentRepository;
    EmployeeRoleRepository employeeRoleRepository;

    @Transactional(readOnly = true)
    public User requireActiveUser(String username) {
        User user = userRepository.findByUsernameWithDetails(username)
                .orElseThrow(() -> new AccessDeniedException("Tài khoản không tồn tại."));

        if (Boolean.TRUE.equals(user.getDeleted()) || !Boolean.TRUE.equals(user.getIsActive())) {
            throw new AccessDeniedException("Tài khoản đã bị khóa hoặc xóa.");
        }
        if (user.getEmployee() == null) {
            throw new AccessDeniedException("Tài khoản chưa được liên kết với nhân viên.");
        }
        if (user.getEmployee().getDepartment() == null && !isAdmin(user)) {
            throw new AccessDeniedException("Tài khoản chưa thuộc phòng ban nào.");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public User requireRoomAccess(String username, UUID departmentId) {
        User user = requireActiveUser(username);
        if (isAdmin(user)) {
            departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new AccessDeniedException("Phòng chat không tồn tại."));
            return user;
        }

        UUID ownDepartmentId = user.getEmployee().getDepartment().getDepartmentId();
        if (!ownDepartmentId.equals(departmentId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập phòng chat này.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public List<Department> getAccessibleDepartments(User user) {
        if (isAdmin(user)) {
            return departmentRepository.findAllByOrderByDepartmentNameAsc();
        }
        return List.of(user.getEmployee().getDepartment());
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(User user) {
        return employeeRoleRepository.findByEmployeeId(user.getEmployee().getEmployeeId())
                .stream()
                .anyMatch(employeeRole ->
                        "ADMIN".equalsIgnoreCase(employeeRole.getRole().getRoleCode()));
    }
}
