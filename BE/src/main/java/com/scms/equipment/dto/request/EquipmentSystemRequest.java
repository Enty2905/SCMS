package com.scms.equipment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentSystemRequest {

    @NotBlank(message = "Tên hệ thống thiết bị không được để trống")
    @Size(max = 200, message = "Tên hệ thống thiết bị không được vượt quá 200 ký tự")
    String systemName;

    @Size(max = 50, message = "Mã hệ thống thiết bị không được vượt quá 50 ký tự")
    String systemCode;

    String description;

    UUID parentSystemId;
}
