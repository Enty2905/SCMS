package com.scms.equipment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicalSpecResponse {
    UUID specId;
    UUID paramId;
    String paramName;
    String paramValue;
    UUID unitId;
    String unitSymbol;
}
