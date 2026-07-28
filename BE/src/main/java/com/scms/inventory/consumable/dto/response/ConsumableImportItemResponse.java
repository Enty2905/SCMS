package com.scms.inventory.consumable.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableImportItemResponse {
    String itemId;
    String consumableId;
    String consumableCode;
    String consumableName;
    String consumableUnit;
    Integer quantity;
    String note;
}
