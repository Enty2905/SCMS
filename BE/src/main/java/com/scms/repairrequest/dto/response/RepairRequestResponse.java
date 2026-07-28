package com.scms.repairrequest.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RepairRequestResponse {

    UUID requestId;
    String priority;   // low | medium | high | critical
    String status;     // pending | confirmed | in_progress | done | cancelled
    String description;
    LocalDateTime createdAt;

    // Thông tin người tạo (Trưởng Ca)
    String createdByName;
    String createdByUsername;

    // Thông tin thiết bị
    UUID equipmentId;
    String equipmentKksCode;
    String equipmentName;
    String equipmentType;
    String equipmentLocation;
    String equipmentStatus;
}
