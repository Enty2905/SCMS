package com.scms.employee.entity;

import com.scms.common.exception.BadRequestException;

import java.util.Arrays;
import java.util.List;

/**
 * Giới tính ghi trên hồ sơ nhân viên.
 * Lưu nhãn tiếng Việt vào cột employee.gender, cho phép để trống khi hồ sơ chưa khai báo.
 */
public enum Gender {

    MALE("Nam"),
    FEMALE("Nữ"),
    OTHER("Khác");

    private final String label;

    Gender(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static List<String> labels() {
        return Arrays.stream(values()).map(Gender::getLabel).toList();
    }

    /**
     * Đọc nhãn từ yêu cầu của người dùng. Bỏ trống thì giữ nguyên là chưa khai báo.
     */
    public static String normalize(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }

        return Arrays.stream(values())
                .filter(gender -> gender.label.equalsIgnoreCase(label.trim()))
                .findFirst()
                .map(Gender::getLabel)
                .orElseThrow(() -> new BadRequestException(
                        "Giới tính không hợp lệ: " + label + ". Chỉ nhận: " + String.join(", ", labels())));
    }
}
