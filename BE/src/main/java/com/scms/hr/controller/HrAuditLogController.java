package com.scms.hr.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.hr.dto.response.HrAuditActionResponse;
import com.scms.hr.dto.response.HrAuditLogResponse;
import com.scms.hr.service.HrAuditService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NHAN_SU')")
public class HrAuditLogController {

    HrAuditService hrAuditService;

    /**
     * Nhật ký thao tác nhân sự, mới nhất trước.
     * Nhật ký chỉ đọc — không có endpoint sửa hay xóa.
     */
    @GetMapping("/audit-logs")
    public ApiResponse<PagedResponse<HrAuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
                "Audit logs loaded successfully",
                hrAuditService.getLogs(search, action, from, to, page, size)
        );
    }

    @GetMapping("/audit-actions")
    public ApiResponse<List<HrAuditActionResponse>> getAuditActions() {
        return ApiResponse.success("Audit actions loaded successfully", hrAuditService.getActions());
    }
}
