package com.scms.inventory.sparepart.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartImportRequest {

    String note;

    @NotEmpty(message = "Danh sách vật tư không được để trống")
    @Valid
    List<SparePartImportItemRequest> items;
}
