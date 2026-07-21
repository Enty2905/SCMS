package com.scms.maintenance.workorder.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkOrderDailyLogResponse {
    UUID logId;
    UUID orderId;
    LocalDate date;
    
    // Thông tin người mở
    UUID openedByUserId;
    String openedByName;
    LocalDateTime openedAt;
    
    // Thông tin người đóng
    UUID closedByUserId;
    String closedByName;
    LocalDateTime closedAt;
    
    String note;
}
