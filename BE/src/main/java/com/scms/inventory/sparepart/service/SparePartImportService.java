package com.scms.inventory.sparepart.service;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.sparepart.dto.request.SparePartImportItemRequest;
import com.scms.inventory.sparepart.dto.request.SparePartImportRequest;
import com.scms.inventory.sparepart.dto.response.SparePartImportItemResponse;
import com.scms.inventory.sparepart.dto.response.SparePartImportResponse;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.entity.SparePartImport;
import com.scms.inventory.sparepart.entity.SparePartImportItem;
import com.scms.inventory.sparepart.repository.SparePartImportRepository;
import com.scms.inventory.sparepart.repository.SparePartRepository;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SparePartImportService {

    SparePartImportRepository importRepository;
    SparePartRepository sparePartRepository;
    UserRepository userRepository;

    @Transactional
    public SparePartImportResponse createImport(SparePartImportRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Danh sách vật tư thay thế không được rỗng");
        }

        Set<UUID> sparePartIds = new HashSet<>();
        for (SparePartImportItemRequest itemReq : request.getItems()) {
            if (!sparePartIds.add(itemReq.getSparePartId())) {
                throw new BadRequestException("Không được chọn trùng vật tư thay thế trong cùng một phiếu nhập");
            }
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User", "username", username));

        String importNumber = generateImportNumber();

        SparePartImport sparePartImport = SparePartImport.builder()
                .importNumber(importNumber)
                .importedBy(currentUser)
                .importedAt(LocalDateTime.now())
                .note(request.getNote())
                .build();

        sparePartImport = importRepository.save(sparePartImport);

        List<SparePartImportItem> items = new ArrayList<>();
        for (SparePartImportItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Số lượng phải > 0");
            }
            SparePart sparePart = sparePartRepository.findById(itemReq.getSparePartId())
                    .orElseThrow(() -> new NotFoundException("SparePart", "id", itemReq.getSparePartId()));

            SparePartImportItem item = SparePartImportItem.builder()
                    .sparePartImport(sparePartImport)
                    .sparePart(sparePart)
                    .quantity(itemReq.getQuantity())
                    .note(itemReq.getNote())
                    .build();
            items.add(item);
        }

        sparePartImport.setItems(items);
        for (SparePartImportItem item : items) {
            item.setSparePartImport(sparePartImport);
        }
        importRepository.saveAndFlush(sparePartImport);

        log.info("Created spare part import: {} by {}", importNumber, username);
        return toResponse(sparePartImport);
    }

    public PagedResponse<SparePartImportResponse> getImports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "importedAt"));
        Page<SparePartImport> importPage = importRepository.findAll(pageable);

        return PagedResponse.<SparePartImportResponse>builder()
                .content(importPage.getContent().stream().map(this::toResponse).toList())
                .page(importPage.getNumber())
                .size(importPage.getSize())
                .totalElements(importPage.getTotalElements())
                .totalPages(importPage.getTotalPages())
                .last(importPage.isLast())
                .build();
    }

    public SparePartImportResponse getImportById(UUID id) {
        SparePartImport sparePartImport = importRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SparePartImport", "id", id));
        return toResponse(sparePartImport);
    }

    private String generateImportNumber() {
        String prefix = "PN-VTTT-INIT-";
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

    private SparePartImportResponse toResponse(SparePartImport imp) {
        List<SparePartImportItemResponse> itemResponses = new ArrayList<>();
        if (imp.getItems() != null) {
            for (SparePartImportItem item : imp.getItems()) {
                itemResponses.add(SparePartImportItemResponse.builder()
                        .itemId(item.getItemId() != null ? item.getItemId().toString() : null)
                        .sparePartId(item.getSparePart().getSparePartId().toString())
                        .sparePartCode(item.getSparePart().getCode())
                        .sparePartName(item.getSparePart().getName())
                        .sparePartUnit(item.getSparePart().getUnit())
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

        return SparePartImportResponse.builder()
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
