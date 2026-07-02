package com.scms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

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
    String employeeName;
    String phone;
    String departmentName;
    String positionName;
    String workLocation;
}
