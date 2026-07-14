package com.scms.inventory.sparepart.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SparePartImportResponse {

    String importId;
    String importNumber;
    String importedBy;
    String importedByName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime importedAt;

    String note;
    List<SparePartImportItemResponse> items;
}
