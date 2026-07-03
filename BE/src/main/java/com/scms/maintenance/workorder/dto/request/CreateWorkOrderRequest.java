package com.scms.maintenance.workorder.dto.request;

import jakarta.validation.constraints.NotBlank;
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

    @NotNull(message = "requestId không được để trống")
    UUID requestId;

    @NotBlank(message = "Số phiếu công tác không được để trống")
    String orderNumber;

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
