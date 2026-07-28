package com.scms.hr.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
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

    @Email(message = "INVALID_KEY")
    @Size(max = 150, message = "INVALID_KEY")
    String email;

    // Nam | Nữ | Khác. Bỏ trống nếu hồ sơ chưa khai báo.
    @Size(max = 20, message = "INVALID_KEY")
    String gender;

    // Đang làm việc | Tạm nghỉ | Đã nghỉ việc. Bỏ trống thì mặc định "Đang làm việc".
    @Size(max = 30, message = "INVALID_KEY")
    String status;

    // Mỗi nhân viên phải thuộc về một phòng ban đang hoạt động.
    @NotNull(message = "INVALID_KEY")
    UUID departmentId;

    UUID positionId;

    @Size(max = 200, message = "INVALID_KEY")
    String workLocation;

    MultipartFile avatar;
}
