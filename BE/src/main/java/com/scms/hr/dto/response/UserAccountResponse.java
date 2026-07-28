package com.scms.hr.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.scms.user.dto.response.RoleResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountResponse {
    UUID userId;
    String username;
    Boolean active;
    LocalDateTime createdAt;
    UUID employeeId;
    String employeeCode;
    String employeeName;
    String phone;
    UUID departmentId;
    String departmentName;
    String positionName;
    String workLocation;
    List<RoleResponse> roles;
}
