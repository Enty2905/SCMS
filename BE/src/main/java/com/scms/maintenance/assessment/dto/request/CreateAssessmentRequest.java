package com.scms.maintenance.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAssessmentRequest {

    @NotNull(message = "equipmentId không được để trống")
    UUID equipmentId;

    @NotBlank(message = "Mô tả hư hỏng không được để trống")
    String damageDescription;

    // Phương án xử lý – có thể để trống ban đầu
    String proposedAction;

    // Employee tạo biên bản (lấy từ JWT hoặc truyền vào)
    // Nếu không truyền, sẽ dùng employee gắn với user đang đăng nhập
    UUID createdByEmployeeId;
}
