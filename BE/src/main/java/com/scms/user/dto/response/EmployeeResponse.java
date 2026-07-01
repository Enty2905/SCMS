package com.scms.user.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeResponse {
    String employeeId;
    String name;
    String phone;
    String avatarUrl;
    String departmentName;
    String positionName;
    String workLocation;
}
