package com.scms.hr.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một mục trong danh mục thao tác, dùng cho ô lọc của màn hình nhật ký.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HrAuditActionResponse {
    String action;
    String label;
    String targetType;
    String targetTypeLabel;
}
