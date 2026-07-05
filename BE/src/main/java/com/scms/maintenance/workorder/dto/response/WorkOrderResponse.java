package com.scms.maintenance.workorder.dto.response;

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
public class WorkOrderResponse {

    UUID orderId;
    String orderNumber;
    String status;      // draft | open | extended | locked
    String content;
    LocalDateTime startDate;
    LocalDateTime endDate;
    LocalDateTime extendedTo;
    LocalDateTime createdAt;

    // Thông tin Request gốc + Thiết bị
    UUID requestId;
    String requestDescription;
    String requestPriority;
    UUID equipmentId;
    String equipmentKksCode;
    String equipmentName;
    String equipmentType;
    String equipmentLocation;

    // Nhân sự phụ trách
    EmployeeInfo workLeader;
    EmployeeInfo directCommander;
    EmployeeInfo safetySupervisor;

    // Người tạo PCT
    String createdByUsername;
    String createdByName;

    // Danh sách thành viên tham gia
    List<MemberInfo> members;

    // ── Inner DTOs ──────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeInfo {
        UUID employeeId;
        String name;
        String positionName;
        String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        UUID employeeId;
        String name;
        String positionName;
        LocalDateTime checkInAt;
        LocalDateTime checkOutAt;
    }
}
