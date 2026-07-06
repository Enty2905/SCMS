package com.scms.hr.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    String departmentCode;
    String departmentName;
    String positionName;
    String workLocation;
    String status;
    Boolean hasAccount;
}
