package com.scms.inventory.sparepart.controller;

import com.scms.common.response.ApiResponse;
import com.scms.inventory.sparepart.dto.request.CreateSparePartRequestDto;
import com.scms.inventory.sparepart.dto.request.IssueSparePartRequestDto;
import com.scms.inventory.sparepart.dto.response.SparePartRequestResponse;
import com.scms.inventory.sparepart.service.SparePartRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/maintenance/spare-part-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Spare Part Request", description = "Quản lý phiếu cấp vật tư thay thế")
public class SparePartRequestController {

    SparePartRequestService sparePartRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    @Operation(summary = "Tạo phiếu cấp vật tư thay thế mới")
    public ApiResponse<SparePartRequestResponse> createRequest(
            @Valid @RequestBody CreateSparePartRequestDto dto,
            Authentication authentication
    ) {
        SparePartRequestResponse response = sparePartRequestService.createRequest(dto, authentication.getName());
        return ApiResponse.created("Phiếu cấp vật tư thay thế đã được tạo thành công", response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'WAREHOUSE_MAT')")
    @Operation(summary = "Danh sách phiếu cấp vật tư thay thế (Phân trang, lọc theo status)")
    public ApiResponse<Page<SparePartRequestResponse>> getRequests(
            @RequestParam(required = false) String reqNumber,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(sparePartRequestService.getRequests(reqNumber, orderNumber, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'WAREHOUSE_MAT')")
    @Operation(summary = "Chi tiết phiếu cấp vật tư thay thế")
    public ApiResponse<SparePartRequestResponse> getRequestById(@PathVariable UUID id) {
        return ApiResponse.success(sparePartRequestService.getRequestById(id));
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
    @Operation(summary = "Cấp phát vật tư thay thế — Thủ kho xác nhận xuất kho")
    public ApiResponse<SparePartRequestResponse> issueRequest(
            @PathVariable UUID id,
            @Valid @RequestBody IssueSparePartRequestDto dto,
            Authentication authentication
    ) {
        SparePartRequestResponse response = sparePartRequestService.issueRequest(id, dto, authentication.getName());
        return ApiResponse.success("Cấp phát vật tư thay thế thành công", response);
    }

    @PostMapping(value = "/{id}/upload-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT')")
    @Operation(summary = "Upload PDF phiếu cấp phát đã ký lên Cloudinary")
    public ApiResponse<SparePartRequestResponse> uploadSignedPdf(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        SparePartRequestResponse response = sparePartRequestService.uploadSignedPdf(id, file);
        return ApiResponse.success("Upload PDF phiếu cấp vật tư thay thế thành công", response);
    }

    @GetMapping("/{id}/export-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'WAREHOUSE_MAT')")
    @Operation(summary = "Xuất file PDF phiếu cấp vật tư thay thế")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        byte[] pdfBytes = sparePartRequestService.exportPdf(id);
        String filename = "Phieu_cap_vattu_thaythe_" + id.toString().substring(0, 8) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(filename).build()
        );
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
