package com.scms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeAccountOptionResponse {
    UUID employeeId;
    String employeeName;
    String phone;
    String departmentName;
    String positionName;
    String workLocation;
}
