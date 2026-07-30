package com.scms.equipment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicalSpecRequest {

    @NotNull(message = "paramId không được để trống")
    UUID paramId;

    String paramValue;

    UUID unitId;
}
