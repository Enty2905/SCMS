package com.scms.inventory.consumable.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableRequest {

    @NotBlank(message = "Mã vật tư không được để trống")
    @Size(max = 50, message = "Mã vật tư tối đa 50 ký tự")
    String code;

    @NotBlank(message = "Tên vật tư không được để trống")
    @Size(max = 255, message = "Tên vật tư tối đa 255 ký tự")
    String name;

    @Size(max = 50, message = "Đơn vị tính tối đa 50 ký tự")
    String unit;

    Integer minQuantity;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    String note;
}
