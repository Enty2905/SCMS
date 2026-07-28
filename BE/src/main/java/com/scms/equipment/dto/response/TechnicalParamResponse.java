package com.scms.equipment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicalParamResponse {
    UUID paramId;
    String paramName;
    String dataType;
}
