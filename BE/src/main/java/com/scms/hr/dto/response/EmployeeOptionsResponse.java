package com.scms.hr.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Danh mục giá trị hợp lệ khi khai báo hồ sơ nhân viên.
 * Giao diện lấy từ đây thay vì tự khai báo cứng, tránh lệch với ràng buộc ở máy chủ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeOptionsResponse {
    List<String> genders;
    List<String> statuses;
}
