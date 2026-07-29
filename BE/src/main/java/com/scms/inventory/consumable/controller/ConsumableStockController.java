package com.scms.inventory.consumable.controller;

import com.scms.common.response.ApiResponse;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.response.ConsumableStockResponse;
import com.scms.inventory.consumable.service.ConsumableStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Consumable Stock", description = "API xem tồn kho vật tư tiêu hao")
@RestController
@RequestMapping("/consumable-stocks")
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MAT', 'TEAM_LEADER', 'REPAIR_MANAGER')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConsumableStockController {

    ConsumableStockService stockService;

    @Operation(summary = "Lấy danh sách tồn kho vật tư tiêu hao (phân trang, tìm kiếm)")
    @GetMapping
    public ApiResponse<PagedResponse<ConsumableStockResponse>> getStocks(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PagedResponse<ConsumableStockResponse>>builder()
                .status(200)
                .message("Lấy danh sách tồn kho thành công")
                .data(stockService.getStocks(code, name, page, size))
                .build();
    }
}
