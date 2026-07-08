package com.scms.inventory.consumable.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableImportResponse {
    String importId;
    String importNumber;
    String importedBy;       // username
    String importedByName;   // tên nhân viên
    LocalDateTime importedAt;
    String note;
    List<ConsumableImportItemResponse> items;
}
