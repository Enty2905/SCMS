package com.scms.inventory.sparepart.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartResponse {
    String sparePartId;
    String code;
    String name;
    String unit;
    Integer minQuantity;
    String note;
}
