package com.scms.maintenance.workorder.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CloseDailyLogRequest {
    @Schema(description = "Ghi chú khi đóng phiếu (tuỳ chọn)")
    String note;
}
