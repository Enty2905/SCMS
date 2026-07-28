package com.scms.inventory.consumable.controller;

import com.scms.common.response.ApiResponse;
import com.scms.inventory.consumable.dto.request.CreateConsumableRequestDto;
import com.scms.inventory.consumable.dto.response.ConsumableRequestResponse;
import com.scms.inventory.consumable.service.ConsumableRequestService;
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

import java.util.UUID;

@RestController
@RequestMapping("/maintenance/consumable-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Consumable Request", description = "Quản lý phiếu cấp vật tư tiêu hao")
public class ConsumableRequestController {

    ConsumableRequestService consumableRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Tạo phiếu cấp vật tư tiêu hao mới dựa trên Phiếu công tác")
    public ApiResponse<ConsumableRequestResponse> createRequest(
            @Valid @RequestBody CreateConsumableRequestDto dto,
            Authentication authentication
    ) {
        ConsumableRequestResponse response = consumableRequestService.createRequest(dto, authentication.getName());
        return ApiResponse.created("Phiếu cấp vật tư tiêu hao đã được tạo thành công", response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Danh sách phiếu cấp vật tư tiêu hao (Phân trang)")
    public ApiResponse<Page<ConsumableRequestResponse>> getRequests(
            @RequestParam(required = false) String reqNumber,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(consumableRequestService.getRequests(reqNumber, orderNumber, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Chi tiết phiếu cấp vật tư tiêu hao")
    public ApiResponse<ConsumableRequestResponse> getRequestById(@PathVariable UUID id) {
        return ApiResponse.success(consumableRequestService.getRequestById(id));
    }

    @GetMapping("/{id}/export-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPAIR_MANAGER', 'TEAM_LEADER')")
    @Operation(summary = "Xuất file PDF phiếu cấp vật tư tiêu hao")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        byte[] pdfBytes = consumableRequestService.exportPdf(id);
        String filename = "Phieu_cap_vattu_tieuhao_" + id.toString().substring(0, 8) + ".pdf";

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
