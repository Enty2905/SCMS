package com.scms.inventory.sparepart.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartStockResponse {

    String sparePartId;
    String code;
    String name;
    String unit;
    Integer minQuantity;
    Long importedQuantity;
    Long exportedQuantity;
    Long stockQuantity;
    String status; // "out", "low", "available"
}
