package com.scms.inventory.tool.service;

import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.inventory.tool.dto.request.ToolRequest;
import com.scms.inventory.tool.dto.response.ToolResponse;
import com.scms.inventory.tool.entity.Tool;
import com.scms.inventory.tool.repository.ToolRepository;
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
public class ToolService {

    ToolRepository toolRepository;

    // ── Thêm mới CCDC ────────────────────────────────────────
    @Transactional
    public ToolResponse createTool(ToolRequest request) {
        int totalQuantity = request.getTotalQuantity();
        int damagedQuantity = request.getDamagedQuantity();

        // Khi tạo mới, chưa có bản ghi mượn nào → borrowedQuantity = 0
        int borrowedQuantity = 0;

        validateQuantities(totalQuantity, borrowedQuantity, damagedQuantity);

        int availableQuantity = totalQuantity - borrowedQuantity - damagedQuantity;
        String status = calculateStatus(damagedQuantity, totalQuantity);

        Tool tool = Tool.builder()
                .name(request.getName())
                .category(request.getCategory())
                .totalQuantity(totalQuantity)
                .availableQuantity(availableQuantity)
                .damagedQuantity(damagedQuantity)
                .status(status)
                .note(request.getNote())
                .build();

        tool = toolRepository.save(tool);
        log.info("Created tool: {} - category: {}", tool.getName(), tool.getCategory());
        return toResponse(tool, borrowedQuantity);
    }

    // ── Lấy danh sách có phân trang, tìm theo tên và chủng loại ──
    public PagedResponse<ToolResponse> getTools(String keyword, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));

        Page<Tool> toolPage = toolRepository.searchByKeywordAndCategory(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                pageable);

        return PagedResponse.<ToolResponse>builder()
                .content(toolPage.getContent().stream()
                        .map(tool -> {
                            int borrowed = toolRepository.sumBorrowedQuantity(tool.getToolId());
                            return toResponse(tool, borrowed);
                        })
                        .toList())
                .page(toolPage.getNumber())
                .size(toolPage.getSize())
                .totalElements(toolPage.getTotalElements())
                .totalPages(toolPage.getTotalPages())
                .last(toolPage.isLast())
                .build();
    }

    // ── Lấy chi tiết theo ID ──────────────────────────────────
    public ToolResponse getToolById(UUID toolId) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new NotFoundException("Tool", "id", toolId));
        int borrowed = toolRepository.sumBorrowedQuantity(toolId);
        return toResponse(tool, borrowed);
    }

    // ── Cập nhật CCDC ─────────────────────────────────────────
    @Transactional
    public ToolResponse updateTool(UUID toolId, ToolRequest request) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new NotFoundException("Tool", "id", toolId));

        int totalQuantity = request.getTotalQuantity();
        int damagedQuantity = request.getDamagedQuantity();
        int borrowedQuantity = toolRepository.sumBorrowedQuantity(toolId);

        validateQuantities(totalQuantity, borrowedQuantity, damagedQuantity);

        int availableQuantity = totalQuantity - borrowedQuantity - damagedQuantity;
        String status = calculateStatus(damagedQuantity, totalQuantity);

        tool.setName(request.getName());
        tool.setCategory(request.getCategory());
        tool.setTotalQuantity(totalQuantity);
        tool.setAvailableQuantity(availableQuantity);
        tool.setDamagedQuantity(damagedQuantity);
        tool.setStatus(status);
        tool.setNote(request.getNote());

        tool = toolRepository.save(tool);
        log.info("Updated tool: {} - status: {}", tool.getName(), tool.getStatus());
        return toResponse(tool, borrowedQuantity);
    }

    // ── Validate số lượng ─────────────────────────────────────
    private void validateQuantities(int totalQuantity, int borrowedQuantity, int damagedQuantity) {
        if (damagedQuantity < 0) {
            throw new IllegalArgumentException("Số lượng hỏng không được âm");
        }
        int maxDamaged = totalQuantity - borrowedQuantity;
        if (damagedQuantity > maxDamaged) {
            throw new IllegalArgumentException(
                    "Số lượng hỏng (" + damagedQuantity + ") không được vượt quá "
                            + "totalQuantity - borrowedQuantity (" + maxDamaged + ")");
        }
        int available = totalQuantity - borrowedQuantity - damagedQuantity;
        if (available < 0) {
            throw new IllegalArgumentException(
                    "Số lượng khả dụng không được âm (tính ra: " + available + ")");
        }
    }

    // ── Tính status tự động ───────────────────────────────────
    // damagedQuantity == totalQuantity → damaged; còn lại → available
    private String calculateStatus(int damagedQuantity, int totalQuantity) {
        return (damagedQuantity == totalQuantity) ? "damaged" : "available";
    }

    // ── Helper: Map Entity → Response ─────────────────────────
    private ToolResponse toResponse(Tool tool, int borrowedQuantity) {
        return ToolResponse.builder()
                .toolId(tool.getToolId().toString())
                .name(tool.getName())
                .category(tool.getCategory())
                .totalQuantity(tool.getTotalQuantity())
                .availableQuantity(tool.getAvailableQuantity())
                .borrowedQuantity(borrowedQuantity)
                .damagedQuantity(tool.getDamagedQuantity())
                .status(tool.getStatus())
                .note(tool.getNote())
                .build();
    }
}
