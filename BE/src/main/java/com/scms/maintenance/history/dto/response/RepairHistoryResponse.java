package com.scms.maintenance.history.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairHistoryResponse {
    UUID historyId;
    UUID equipmentId;
    String equipmentKksCode;
    String equipmentName;
    UUID orderId;
    String orderNumber;
    String description;
    LocalDateTime repairedAt;
    String repairedByUsername;
    String repairedByName;
}
