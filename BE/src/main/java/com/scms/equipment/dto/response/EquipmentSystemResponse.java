package com.scms.equipment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentSystemResponse {
    UUID systemId;
    String systemName;
    String systemCode;
    String description;
    UUID parentSystemId;
}
