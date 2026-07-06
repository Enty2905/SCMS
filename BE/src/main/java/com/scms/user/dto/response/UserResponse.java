package com.scms.user.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String userId;
    String username;
    Boolean isActive;
    LocalDateTime createdAt;
    EmployeeResponse employee;
    List<RoleResponse> roles;
}
