package com.scms.inventory.consumable.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableImportRequest {

    String note;

    @NotEmpty(message = "Danh sách vật tư không được rỗng")
    @Valid
    List<ConsumableImportItemRequest> items;
}
