package com.scms.maintenance.history.dto.request;

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
public class CreateRepairHistoryRequest {

    @NotNull(message = "ID thiết bị không được để trống")
    UUID equipmentId;

    @NotNull(message = "Phiếu công tác liên kết không được để trống")
    UUID orderId;

    String description;

    @NotNull(message = "Thời gian hoàn thành sửa chữa không được để trống")
    LocalDateTime repairedAt;
}
