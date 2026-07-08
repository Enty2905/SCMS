package com.scms.inventory.consumable.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableStockResponse {
    String consumableId;
    String code;
    String name;
    String unit;
    Integer minQuantity;
    Long importedQuantity;
    Long exportedQuantity;
    Long stockQuantity;
    // "available" | "low" | "out"
    String status;
}
