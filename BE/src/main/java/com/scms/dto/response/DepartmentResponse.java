package com.scms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentResponse {
    UUID departmentId;
    String departmentCode;
    String departmentName;
    Long employeeCount;
}
