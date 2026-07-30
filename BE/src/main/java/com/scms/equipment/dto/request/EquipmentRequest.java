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
public class EquipmentRequest {

    @NotBlank(message = "Mã KKS không được để trống")
    @Size(max = 100, message = "Mã KKS không được vượt quá 100 ký tự")
    String kksCode;

    @NotBlank(message = "Tên thiết bị không được để trống")
    @Size(max = 200, message = "Tên thiết bị không được vượt quá 200 ký tự")
    String equipmentName;

    @NotBlank(message = "Loại thiết bị không được để trống")
    @Size(max = 100, message = "Loại thiết bị không được vượt quá 100 ký tự")
    String equipmentType;

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 20, message = "Trạng thái không được vượt quá 20 ký tự")
    String status;

    @Size(max = 200, message = "Vị trí không được vượt quá 200 ký tự")
    String location;

    UUID systemId;

    java.util.List<TechnicalSpecRequest> specs;
}
