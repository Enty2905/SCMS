package com.scms.inventory.sparepart.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartImportItemResponse {

    String itemId;
    String sparePartId;
    String sparePartCode;
    String sparePartName;
    String sparePartUnit;
    Integer quantity;
    String note;
}
