package com.scms.inventory.tool.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToolRequest {

    @NotBlank(message = "Tên CCDC không được để trống")
    @Size(max = 255, message = "Tên CCDC tối đa 255 ký tự")
    String name;

    @Size(max = 100, message = "Chủng loại tối đa 100 ký tự")
    String category;

    @NotNull(message = "Tổng số lượng không được để trống")
    @Min(value = 0, message = "Tổng số lượng phải >= 0")
    Integer totalQuantity;

    // Số lượng bị hỏng — bắt buộc, mặc định 0
    @NotNull(message = "Số lượng hỏng không được để trống")
    @Min(value = 0, message = "Số lượng hỏng phải >= 0")
    Integer damagedQuantity;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    String note;

    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    String imageUrl;
}
