package com.scms.inventory.sparepart.service;

import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.response.SparePartStockResponse;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.repository.SparePartStockRepository;
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
public class SparePartStockService {

    SparePartStockRepository stockRepository;

    public PagedResponse<SparePartStockResponse> getStocks(String code, String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "code"));

        String searchCode = (code != null && !code.isBlank()) ? code.trim() : null;
        String searchName = (name != null && !name.isBlank()) ? name.trim() : null;

        Page<SparePart> sparePartPage = stockRepository.searchByCodeAndName(searchCode, searchName, pageable);

        return PagedResponse.<SparePartStockResponse>builder()
                .content(sparePartPage.getContent().stream()
                        .map(this::toStockResponse)
                        .toList())
                .page(sparePartPage.getNumber())
                .size(sparePartPage.getSize())
                .totalElements(sparePartPage.getTotalElements())
                .totalPages(sparePartPage.getTotalPages())
                .last(sparePartPage.isLast())
                .build();
    }

    private SparePartStockResponse toStockResponse(SparePart sparePart) {
        long imported = stockRepository.sumImported(sparePart.getSparePartId());
        long exported = stockRepository.sumExported(sparePart.getSparePartId().toString());
        long stock = imported - exported;

        int minQty = sparePart.getMinQuantity() != null ? sparePart.getMinQuantity() : 0;

        String status;
        if (stock == 0) {
            status = "out";
        } else if (stock <= minQty) {
            status = "low";
        } else {
            status = "available";
        }

        return SparePartStockResponse.builder()
                .sparePartId(sparePart.getSparePartId().toString())
                .code(sparePart.getCode())
                .name(sparePart.getName())
                .unit(sparePart.getUnit())
                .minQuantity(minQty)
                .importedQuantity(imported)
                .exportedQuantity(exported)
                .stockQuantity(stock)
                .status(status)
                .build();
    }
}
