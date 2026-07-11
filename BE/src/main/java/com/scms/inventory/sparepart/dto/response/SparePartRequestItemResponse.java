package com.scms.inventory.sparepart.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartRequestItemResponse {
    UUID itemId;
    UUID sparePartId;
    String code;
    String name;
    String unit;
    Integer quantityRequested;
    Integer quantityIssued;
}
