package com.scms.maintenance.workorder.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWorkOrderRequest {

    // requestId tuỳ chọn – PCT có thể tạo độc lập không cần liên kết request
    UUID requestId;

    // orderNumber được sinh tự động bởi service (PCT-0001, PCT-0002, ...)
    // Không nhận từ client nữa

    String content;

    LocalDateTime startDate;
    LocalDateTime endDate;

    @NotNull(message = "Người lãnh đạo công việc không được để trống")
    UUID workLeaderId;

    @NotNull(message = "Người chỉ huy trực tiếp không được để trống")
    UUID directCommanderId;

    @NotNull(message = "Người giám sát an toàn không được để trống")
    UUID safetySupervisorId;

    // Danh sách nhân viên thực hiện (có thể rỗng)
    List<UUID> memberIds;
}
