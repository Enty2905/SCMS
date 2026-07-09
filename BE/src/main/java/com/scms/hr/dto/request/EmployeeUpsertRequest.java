package com.scms.hr.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeUpsertRequest {

    @NotBlank(message = "INVALID_KEY")
    @Size(max = 150, message = "INVALID_KEY")
    String employeeName;

    @Size(max = 20, message = "INVALID_KEY")
    String phone;

    UUID departmentId;

    UUID positionId;

    @Size(max = 200, message = "INVALID_KEY")
    String workLocation;

    MultipartFile avatar;
}
