package com.scms.inventory.consumable.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.consumable.dto.request.ConsumableImportItemRequest;
import com.scms.inventory.consumable.dto.request.ConsumableImportRequest;
import com.scms.inventory.consumable.dto.response.ConsumableImportItemResponse;
import com.scms.inventory.consumable.dto.response.ConsumableImportResponse;
import com.scms.inventory.consumable.entity.Consumable;
import com.scms.inventory.consumable.entity.ConsumableImport;
import com.scms.inventory.consumable.entity.ConsumableImportItem;
import com.scms.inventory.consumable.repository.ConsumableImportRepository;
import com.scms.inventory.consumable.repository.ConsumableRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ConsumableImportService {

    ConsumableImportRepository importRepository;
    ConsumableRepository consumableRepository;
    UserRepository userRepository;

    // ── Tạo phiếu nhập kho ───────────────────────────────────
    @Transactional
    public ConsumableImportResponse createImport(ConsumableImportRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Danh sách vật tư không được rỗng");
        }

        // Lấy user đang đăng nhập từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User", "username", username));

        // Sinh importNumber: PNK-VTTH-YYYYMM-NNN
        String importNumber = generateImportNumber();

        // Tạo ConsumableImport
        ConsumableImport consumableImport = ConsumableImport.builder()
                .importNumber(importNumber)
                .importedBy(currentUser)
                .importedAt(LocalDateTime.now())
                .note(request.getNote())
                .build();

        consumableImport = importRepository.save(consumableImport);

        // Tạo các ConsumableImportItem
        List<ConsumableImportItem> items = new ArrayList<>();
        for (ConsumableImportItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Số lượng phải > 0");
            }
            Consumable consumable = consumableRepository.findById(itemReq.getConsumableId())
                    .orElseThrow(() -> new NotFoundException("Consumable", "id", itemReq.getConsumableId()));

            ConsumableImportItem item = ConsumableImportItem.builder()
                    .consumableImport(consumableImport)
                    .consumable(consumable)
                    .quantity(itemReq.getQuantity())
                    .note(itemReq.getNote())
                    .build();
            items.add(item);
        }

        // Save all items (cascade or manual)
        // Since we use CascadeType.ALL on the import, set items and save
        consumableImport.setItems(items);
        // Items need to be saved separately since they reference the saved import
        for (ConsumableImportItem item : items) {
            item.setConsumableImport(consumableImport);
        }
        // Use a list repository save approach
        importRepository.saveAndFlush(consumableImport);

        log.info("Created consumable import: {} by {}", importNumber, username);
        return toResponse(consumableImport);
    }

    // ── Lấy danh sách phiếu nhập ─────────────────────────────
    public PagedResponse<ConsumableImportResponse> getImports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "importedAt"));
        Page<ConsumableImport> importPage = importRepository.findAll(pageable);

        return PagedResponse.<ConsumableImportResponse>builder()
                .content(importPage.getContent().stream().map(this::toResponse).toList())
                .page(importPage.getNumber())
                .size(importPage.getSize())
                .totalElements(importPage.getTotalElements())
                .totalPages(importPage.getTotalPages())
                .last(importPage.isLast())
                .build();
    }

    // ── Lấy chi tiết phiếu nhập theo ID ──────────────────────
    public ConsumableImportResponse getImportById(UUID id) {
        ConsumableImport consumableImport = importRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ConsumableImport", "id", id));
        return toResponse(consumableImport);
    }

    // ── Sinh importNumber tự động ─────────────────────────────
    // Format: PNK-VTTH-YYYYMM-NNN
    private String generateImportNumber() {
        String yearMonth = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String prefix = "PNK-VTTH-" + yearMonth + "-";
        String maxNumber = importRepository.findMaxImportNumberByPrefix(prefix);

        int nextSeq = 1;
        if (maxNumber != null) {
            try {
                String seqPart = maxNumber.substring(prefix.length());
                nextSeq = Integer.parseInt(seqPart) + 1;
            } catch (Exception e) {
                log.warn("Could not parse import number sequence from: {}", maxNumber);
            }
        }
        return prefix + String.format("%03d", nextSeq);
    }

    // ── Helper: Map Entity → Response ─────────────────────────
    private ConsumableImportResponse toResponse(ConsumableImport imp) {
        List<ConsumableImportItemResponse> itemResponses = new ArrayList<>();
        if (imp.getItems() != null) {
            for (ConsumableImportItem item : imp.getItems()) {
                itemResponses.add(ConsumableImportItemResponse.builder()
                        .itemId(item.getItemId() != null ? item.getItemId().toString() : null)
                        .consumableId(item.getConsumable().getConsumableId().toString())
                        .consumableCode(item.getConsumable().getCode())
                        .consumableName(item.getConsumable().getName())
                        .consumableUnit(item.getConsumable().getUnit())
                        .quantity(item.getQuantity())
                        .note(item.getNote())
                        .build());
            }
        }

        String importedByUsername = null;
        String importedByName = null;
        if (imp.getImportedBy() != null) {
            importedByUsername = imp.getImportedBy().getUsername();
            if (imp.getImportedBy().getEmployee() != null) {
                importedByName = imp.getImportedBy().getEmployee().getName();
            }
        }

        return ConsumableImportResponse.builder()
                .importId(imp.getImportId() != null ? imp.getImportId().toString() : null)
                .importNumber(imp.getImportNumber())
                .importedBy(importedByUsername)
                .importedByName(importedByName)
                .importedAt(imp.getImportedAt())
                .note(imp.getNote())
                .items(itemResponses)
                .build();
    }
}
