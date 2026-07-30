package com.scms.hr.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HrAuditLogResponse {
    UUID id;
    String action;
    String actionLabel;
    String targetType;
    String targetTypeLabel;
    UUID targetId;
    String targetName;
    String performedBy;
    String performedByName;
    String detail;
    LocalDateTime createdAt;
}
