package com.scms.maintenance.assessment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentResponse {

    UUID assessmentId;
    String assessmentNumber;
    String damageDescription;
    String proposedAction;
    LocalDateTime createdAt;

    /**
     * "draft"  – chưa có file PDF được upload
     * "signed" – đã có file PDF (pdfUrl không null)
     */
    String completionStatus;

    // File PDF đã ký (null nếu chưa upload)
    String pdfUrl;

    // Thông tin thiết bị
    UUID equipmentId;
    String equipmentKksCode;
    String equipmentName;
    String equipmentType;
    String equipmentLocation;

    // Người tạo biên bản
    UUID createdByEmployeeId;
    String createdByName;
    String createdByPosition;

    // Ký tên bên sửa chữa
    UUID repairSignedById;
    String repairSignedByName;
    LocalDateTime repairSignedAt;

    // Ký tên bên vận hành
    UUID operationSignedById;
    String operationSignedByName;
    LocalDateTime operationSignedAt;
}
