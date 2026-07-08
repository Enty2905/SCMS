package com.scms.inventory.sparepart.service;

import com.scms.common.exception.DuplicateResourceException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.request.SparePartRequest;
import com.scms.inventory.sparepart.dto.response.SparePartResponse;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.repository.SparePartRepository;
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
public class SparePartService {

    SparePartRepository sparePartRepository;

    // ── Thêm mới vật tư thay thế ──────────────────────────────
    @Transactional
    public SparePartResponse createSparePart(SparePartRequest request) {
        // Tự động tạo mã vật tư VTTT-(6 số)
        String maxCode = sparePartRepository.findMaxCode();
        int nextNumber = 1;
        if (maxCode != null && maxCode.startsWith("VTTT-")) {
            try {
                nextNumber = Integer.parseInt(maxCode.substring(5)) + 1;
            } catch (NumberFormatException e) {
                log.warn("Invalid max code format: {}", maxCode);
            }
        }
        String newCode = String.format("VTTT-%06d", nextNumber);

        SparePart sparePart = SparePart.builder()
                .code(newCode)
                .name(request.getName())
                .unit(request.getUnit())
                .minQuantity(request.getMinQuantity())
                .note(request.getNote())
                .build();

        sparePart = sparePartRepository.save(sparePart);
        log.info("Created spare part: {} - {}", sparePart.getCode(), sparePart.getName());
        return toResponse(sparePart);
    }

    // ── Lấy danh sách có phân trang và tìm kiếm ──────────────
    public PagedResponse<SparePartResponse> getSpareParts(String code, String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "code"));

        String searchCode = (code != null && !code.isBlank()) ? code.trim() : null;
        String searchName = (name != null && !name.isBlank()) ? name.trim() : null;

        Page<SparePart> sparePartPage;
        if (searchCode != null || searchName != null) {
            sparePartPage = sparePartRepository.searchByCodeAndName(searchCode, searchName, pageable);
        } else {
            sparePartPage = sparePartRepository.findAll(pageable);
        }

        return PagedResponse.<SparePartResponse>builder()
                .content(sparePartPage.getContent().stream()
                        .map(this::toResponse)
                        .toList())
                .page(sparePartPage.getNumber())
                .size(sparePartPage.getSize())
                .totalElements(sparePartPage.getTotalElements())
                .totalPages(sparePartPage.getTotalPages())
                .last(sparePartPage.isLast())
                .build();
    }

    // ── Lấy chi tiết theo ID ──────────────────────────────────
    public SparePartResponse getSparePartById(UUID sparePartId) {
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new NotFoundException("SparePart", "id", sparePartId));
        return toResponse(sparePart);
    }

    // ── Cập nhật vật tư thay thế ──────────────────────────────
    @Transactional
    public SparePartResponse updateSparePart(UUID sparePartId, SparePartRequest request) {
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new NotFoundException("SparePart", "id", sparePartId));

        sparePart.setName(request.getName());
        sparePart.setUnit(request.getUnit());
        sparePart.setMinQuantity(request.getMinQuantity());
        sparePart.setNote(request.getNote());

        sparePart = sparePartRepository.save(sparePart);
        log.info("Updated spare part: {} - {}", sparePart.getCode(), sparePart.getName());
        return toResponse(sparePart);
    }

    // ── Xóa vật tư thay thế ──────────────────────────────────
    @Transactional
    public void deleteSparePart(UUID sparePartId) {
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new NotFoundException("SparePart", "id", sparePartId));
        sparePartRepository.delete(sparePart);
        log.info("Deleted spare part: {} - {}", sparePart.getCode(), sparePart.getName());
    }

    // ── Helper: Map Entity → Response ─────────────────────────
    private SparePartResponse toResponse(SparePart sparePart) {
        return SparePartResponse.builder()
                .sparePartId(sparePart.getSparePartId().toString())
                .code(sparePart.getCode())
                .name(sparePart.getName())
                .unit(sparePart.getUnit())
                .minQuantity(sparePart.getMinQuantity())
                .note(sparePart.getNote())
                .build();
    }
}
