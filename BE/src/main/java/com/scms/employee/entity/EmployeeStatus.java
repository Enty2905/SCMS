package com.scms.employee.entity;

import com.scms.common.exception.BadRequestException;

import java.util.Arrays;
import java.util.List;

/**
 * Tình trạng làm việc của nhân viên.
 * Lưu vào cột employee.status dưới dạng nhãn tiếng Việt để hiển thị thẳng lên giao diện
 * và tra cứu trực tiếp trong cơ sở dữ liệu mà không cần bảng quy đổi.
 */
public enum EmployeeStatus {

    WORKING("Đang làm việc"),
    ON_LEAVE("Tạm nghỉ"),
    RESIGNED("Đã nghỉ việc");

    private final String label;

    EmployeeStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static EmployeeStatus defaultStatus() {
        return WORKING;
    }

    public static List<String> labels() {
        return Arrays.stream(values()).map(EmployeeStatus::getLabel).toList();
    }

    /**
     * Đọc nhãn từ yêu cầu của người dùng. Bỏ trống thì hiểu là "Đang làm việc".
     */
    public static EmployeeStatus fromLabel(String label) {
        if (label == null || label.isBlank()) {
            return defaultStatus();
        }

        return Arrays.stream(values())
                .filter(status -> status.label.equalsIgnoreCase(label.trim()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "Tình trạng làm việc không hợp lệ: " + label
                                + ". Chỉ nhận: " + String.join(", ", labels())));
    }
}
