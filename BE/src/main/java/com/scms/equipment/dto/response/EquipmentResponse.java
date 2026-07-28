package com.scms.equipment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentResponse {
    UUID id;
    String kksCode;
    String equipmentName;
    String equipmentType;
    String status;
    String location;
    UUID systemId;
    List<EquipmentImageResponse> images;
}
