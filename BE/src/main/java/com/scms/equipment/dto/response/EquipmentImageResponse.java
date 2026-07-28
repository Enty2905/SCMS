package com.scms.equipment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentImageResponse {
    UUID id;
    UUID equipmentId;
    String imageUrl;
    String caption;
    UUID uploadedBy;
    LocalDateTime uploadedAt;
}
