package com.scms.maintenance.assessment.controller;

import com.scms.common.response.ApiResponse;
import com.scms.maintenance.assessment.dto.request.CreateAssessmentRequest;
import com.scms.maintenance.assessment.dto.response.AssessmentResponse;
import com.scms.maintenance.assessment.service.TechnicalAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/maintenance/assessments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Technical Assessment", description = "Biên bản đánh giá kỹ thuật")
public class TechnicalAssessmentController {

    TechnicalAssessmentService assessmentService;

    /**
     * Chức năng 3A: Tạo biên bản đánh giá kỹ thuật
     * Quyền: TEAM_LEADER, ADMIN
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    @Operation(
        summary = "Tạo biên bản đánh giá kỹ thuật",
        description = "Tạo biên bản đánh giá kỹ thuật cho thiết bị hư hỏng. " +
                      "Nếu không truyền createdByEmployeeId, hệ thống sẽ dùng employee gắn với tài khoản đang đăng nhập."
    )
    public ApiResponse<AssessmentResponse> createAssessment(
            @Valid @RequestBody CreateAssessmentRequest request,
            Authentication authentication
    ) {
        AssessmentResponse response = assessmentService.createAssessment(request, authentication.getName());
        return ApiResponse.created("Biên bản đánh giá kỹ thuật đã được tạo", response);
    }

    /**
     * Xem chi tiết biên bản
     * Quyền: TEAM_LEADER, REPAIR_MANAGER, ADMIN
     */
    @GetMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'REPAIR_MANAGER')")
    @Operation(summary = "Chi tiết biên bản đánh giá kỹ thuật")
    public ApiResponse<AssessmentResponse> getAssessment(@PathVariable UUID assessmentId) {
        return ApiResponse.success(assessmentService.getAssessmentById(assessmentId));
    }

    /**
     * Chức năng 3B: Xuất file PDF biên bản đánh giá
     * Quyền: TEAM_LEADER, ADMIN
     *
     * Trả về file PDF để download thẳng trên trình duyệt
     */
    @GetMapping("/{assessmentId}/export-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    @Operation(
        summary = "Xuất PDF biên bản đánh giá kỹ thuật",
        description = "Generate và download file PDF từ dữ liệu biên bản trong hệ thống. " +
                      "Sau khi in và ký vật lý, dùng API upload-signed-pdf để lưu lại."
    )
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID assessmentId) {
        byte[] pdfBytes = assessmentService.exportPdf(assessmentId);

        String filename = "assessment_" + assessmentId.toString().substring(0, 8) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(filename).build()
        );
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    /**
     * Chức năng 3C: Upload file PDF đã ký vật lý lên hệ thống
     * Quyền: TEAM_LEADER, ADMIN
     *
     * Sau khi 2 bên ký tay vào bản in, scan/chụp rồi upload lại file PDF này
     */
    @PostMapping(value = "/{assessmentId}/upload-signed-pdf", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    @Operation(
        summary = "Upload PDF biên bản đã ký",
        description = "Upload file PDF biên bản đã được ký vật lý bởi 2 bên. " +
                      "Hệ thống sẽ lưu file và cập nhật trạng thái biên bản thành 'signed'."
    )
    public ApiResponse<AssessmentResponse> uploadSignedPdf(
            @PathVariable UUID assessmentId,
            @RequestParam("file") MultipartFile file
    ) {
        AssessmentResponse response = assessmentService.uploadSignedPdf(assessmentId, file);
        return ApiResponse.success("Upload PDF đã ký thành công. Biên bản đã hoàn thành.", response);
    }
}
