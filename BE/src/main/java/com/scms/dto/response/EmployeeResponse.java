package com.scms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeResponse {
    UUID employeeId;
    String employeeCode;
    String employeeName;
    String phone;
    String email;
    String gender;
    String departmentName;
    String departmentCode;
    String positionName;
    String workLocation;
    String status;
    Boolean hasAccount;
}
