package com.scms.inventory.consumable.service;

import com.scms.common.exception.DuplicateResourceException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.request.ConsumableRequest;
import com.scms.inventory.consumable.dto.response.ConsumableResponse;
import com.scms.inventory.consumable.entity.Consumable;
import com.scms.inventory.consumable.repository.ConsumableRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ConsumableService {

    ConsumableRepository consumableRepository;

    // ── Thêm mới vật tư tiêu hao ─────────────────────────────
    @Transactional
    public ConsumableResponse createConsumable(ConsumableRequest request) {
        // Kiểm tra trùng mã
        if (consumableRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Consumable", "code", request.getCode());
        }

        Consumable consumable = Consumable.builder()
                .code(request.getCode())
                .name(request.getName())
                .unit(request.getUnit())
                .minQuantity(request.getMinQuantity())
                .note(request.getNote())
                .build();

        consumable = consumableRepository.save(consumable);
        log.info("Created consumable: {} - {}", consumable.getCode(), consumable.getName());
        return toResponse(consumable);
    }

    // ── Lấy danh sách có phân trang và tìm kiếm ──────────────
    public PagedResponse<ConsumableResponse> getConsumables(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "code"));

        Page<Consumable> consumablePage;
        if (keyword != null && !keyword.isBlank()) {
            consumablePage = consumableRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            consumablePage = consumableRepository.findAll(pageable);
        }

        return PagedResponse.<ConsumableResponse>builder()
                .content(consumablePage.getContent().stream()
                        .map(this::toResponse)
                        .toList())
                .page(consumablePage.getNumber())
                .size(consumablePage.getSize())
                .totalElements(consumablePage.getTotalElements())
                .totalPages(consumablePage.getTotalPages())
                .last(consumablePage.isLast())
                .build();
    }

    // ── Lấy chi tiết theo ID ──────────────────────────────────
    public ConsumableResponse getConsumableById(UUID consumableId) {
        Consumable consumable = consumableRepository.findById(consumableId)
                .orElseThrow(() -> new NotFoundException("Consumable", "id", consumableId));
        return toResponse(consumable);
    }

    // ── Cập nhật vật tư tiêu hao ──────────────────────────────
    @Transactional
    public ConsumableResponse updateConsumable(UUID consumableId, ConsumableRequest request) {
        Consumable consumable = consumableRepository.findById(consumableId)
                .orElseThrow(() -> new NotFoundException("Consumable", "id", consumableId));

        // Kiểm tra trùng mã với bản ghi khác
        consumableRepository.findByCode(request.getCode())
                .ifPresent(existing -> {
                    if (!existing.getConsumableId().equals(consumableId)) {
                        throw new DuplicateResourceException("Consumable", "code", request.getCode());
                    }
                });

        consumable.setCode(request.getCode());
        consumable.setName(request.getName());
        consumable.setUnit(request.getUnit());
        consumable.setMinQuantity(request.getMinQuantity());
        consumable.setNote(request.getNote());

        consumable = consumableRepository.save(consumable);
        log.info("Updated consumable: {} - {}", consumable.getCode(), consumable.getName());
        return toResponse(consumable);
    }

    // ── Xóa vật tư tiêu hao ──────────────────────────────────
    @Transactional
    public void deleteConsumable(UUID consumableId) {
        Consumable consumable = consumableRepository.findById(consumableId)
                .orElseThrow(() -> new NotFoundException("Consumable", "id", consumableId));
        consumableRepository.delete(consumable);
        log.info("Deleted consumable: {} - {}", consumable.getCode(), consumable.getName());
    }

    // ── Helper: Map Entity → Response ─────────────────────────
    private ConsumableResponse toResponse(Consumable consumable) {
        return ConsumableResponse.builder()
                .consumableId(consumable.getConsumableId().toString())
                .code(consumable.getCode())
                .name(consumable.getName())
                .unit(consumable.getUnit())
                .minQuantity(consumable.getMinQuantity())
                .note(consumable.getNote())
                .build();
    }
}
