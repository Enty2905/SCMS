package com.scms.inventory.tool.borrow.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToolBorrowResponse {

    String borrowId;

    String toolId;
    String toolName;

    String employeeId;
    String employeeName;
    String employeePhone;

    Integer quantity;
    Integer remainingQuantity;
    Integer returnedQuantity;

    LocalDateTime borrowedAt;
    LocalDateTime dueDate;
    LocalDateTime returnedAt;

    // 'borrowing' | 'overdue' | 'returned'
    String status;

    String note;

    // Số ngày quá hạn (chỉ > 0 khi status = overdue | returned mà trả muộn)
    long overdueDays;
}
