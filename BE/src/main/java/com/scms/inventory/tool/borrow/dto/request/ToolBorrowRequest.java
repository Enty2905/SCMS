package com.scms.inventory.tool.borrow.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToolBorrowRequest {

    @NotNull(message = "ID công cụ không được để trống")
    UUID toolId;

    @NotNull(message = "ID nhân viên không được để trống")
    UUID employeeId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng mượn phải > 0")
    Integer quantity;

    @NotNull(message = "Hạn trả không được để trống")
    @Future(message = "Hạn trả phải sau thời điểm hiện tại")
    LocalDateTime dueDate;

    String note;
}
