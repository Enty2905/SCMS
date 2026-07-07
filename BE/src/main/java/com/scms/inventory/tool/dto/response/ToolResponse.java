package com.scms.inventory.tool.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToolResponse {
    String toolId;
    String name;
    String category;
    Integer totalQuantity;
    Integer availableQuantity;
    Integer borrowedQuantity;
    Integer damagedQuantity;
    String status;
    String note;
}
