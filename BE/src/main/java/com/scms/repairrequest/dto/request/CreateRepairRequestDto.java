package com.scms.repairrequest.dto.request;

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
public class CreateRepairRequestDto {

    // ID của thiết bị cần sửa chữa
    @NotNull(message = "Equipment ID không được để trống")
    UUID equipmentId;

    // Mô tả chi tiết vấn đề (bắt buộc)
    @NotBlank(message = "Mô tả sự cố không được để trống")
    String description;

    // Mức độ ưu tiên: low | medium | high | critical (mặc định medium)
    String priority;
}
