package com.scms.inventory.consumable.service;

import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.response.ConsumableStockResponse;
import com.scms.inventory.consumable.entity.Consumable;
import com.scms.inventory.consumable.repository.ConsumableStockRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ConsumableStockService {

    ConsumableStockRepository stockRepository;

    // ── Tồn kho vật tư tiêu hao với phân trang và tìm kiếm ──
    public PagedResponse<ConsumableStockResponse> getStocks(String code, String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "code"));

        String searchCode = (code != null && !code.isBlank()) ? code.trim() : null;
        String searchName = (name != null && !name.isBlank()) ? name.trim() : null;

        Page<Consumable> consumablePage = stockRepository.searchByCodeAndName(searchCode, searchName, pageable);

        return PagedResponse.<ConsumableStockResponse>builder()
                .content(consumablePage.getContent().stream()
                        .map(this::toStockResponse)
                        .toList())
                .page(consumablePage.getNumber())
                .size(consumablePage.getSize())
                .totalElements(consumablePage.getTotalElements())
                .totalPages(consumablePage.getTotalPages())
                .last(consumablePage.isLast())
                .build();
    }

    // ── Helper: Map Entity → Stock Response ──────────────────
    private ConsumableStockResponse toStockResponse(Consumable consumable) {
        long imported = stockRepository.sumImported(consumable.getConsumableId());
        long exported = stockRepository.sumExported(consumable.getConsumableId().toString());
        long stock = imported - exported;

        int minQty = consumable.getMinQuantity() != null ? consumable.getMinQuantity() : 0;

        String status;
        if (stock == 0) {
            status = "out";
        } else if (stock <= minQty) {
            status = "low";
        } else {
            status = "available";
        }

        return ConsumableStockResponse.builder()
                .consumableId(consumable.getConsumableId().toString())
                .code(consumable.getCode())
                .name(consumable.getName())
                .unit(consumable.getUnit())
                .minQuantity(minQty)
                .importedQuantity(imported)
                .exportedQuantity(exported)
                .stockQuantity(stock)
                .status(status)
                .build();
    }
}
