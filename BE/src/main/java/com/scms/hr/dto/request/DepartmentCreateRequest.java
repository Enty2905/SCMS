package com.scms.hr.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentCreateRequest {

    @NotBlank(message = "INVALID_KEY")
    @Size(max = 150, message = "INVALID_KEY")
    String departmentName;

    @Size(max = 50, message = "INVALID_KEY")
    String departmentCode;

    @Size(max = 500, message = "INVALID_KEY")
    String description;
}
