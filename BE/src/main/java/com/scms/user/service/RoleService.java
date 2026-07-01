package com.scms.user.service;

import com.scms.user.dto.request.RoleRequest;
import com.scms.user.dto.response.RoleResponse;
import com.scms.user.entity.Role;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.user.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleService {

    RoleRepository roleRepository;

    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR')")
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream().map(this::toRoleResponse).toList();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public RoleResponse getRoleById(UUID roleId) {
        return toRoleResponse(roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.findByRoleCode(request.getRoleCode()).isPresent()) {
            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
        }
        Role role = Role.builder()
                .roleCode(request.getRoleCode().toUpperCase())
                .roleName(request.getRoleName())
                .description(request.getDescription())
                .build();
        role = roleRepository.save(role);
        log.info("Created role: {}", role.getRoleCode());
        return toRoleResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public RoleResponse updateRole(UUID roleId, RoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        role.setRoleName(request.getRoleName());
        role.setDescription(request.getDescription());
        role = roleRepository.save(role);
        log.info("Updated role: {}", role.getRoleCode());
        return toRoleResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void deleteRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        roleRepository.delete(role);
        log.info("Deleted role: {}", role.getRoleCode());
    }

    private RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder()
                .roleId(role.getRoleId().toString())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .build();
    }
}
