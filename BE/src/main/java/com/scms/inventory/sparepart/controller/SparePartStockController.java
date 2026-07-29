package com.scms.inventory.sparepart.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.response.SparePartStockResponse;
import com.scms.inventory.sparepart.service.SparePartStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Spare Part Stock", description = "API tồn kho vật tư thay thế")
@RestController
@RequestMapping("/spare-part-stocks")
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT', 'TEAM_LEADER', 'REPAIR_MANAGER')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SparePartStockController {

    SparePartStockService stockService;

    @Operation(summary = "Lấy danh sách tồn kho vật tư thay thế")
    @GetMapping
    public ApiResponse<PagedResponse<SparePartStockResponse>> getStocks(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Keyword can be matched against code or name
        return ApiResponse.<PagedResponse<SparePartStockResponse>>builder()
                .status(200)
                .message("Lấy thông tin tồn kho thành công")
                .data(stockService.getStocks(keyword, keyword, page, size))
                .build();
    }
}
