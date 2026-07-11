package com.scms.inventory.consumable.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableRequestItemResponse {
    UUID itemId;
    UUID consumableId;
    String code;
    String name;
    String unit;
    Integer quantityRequested;
    Integer quantityIssued;
}
