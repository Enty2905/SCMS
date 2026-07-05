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
        validateQuantity(request);

        String status = calculateStatus(request.getAvailableQuantity());

        Tool tool = Tool.builder()
                .name(request.getName())
                .category(request.getCategory())
                .totalQuantity(request.getTotalQuantity())
                .availableQuantity(request.getAvailableQuantity())
                .status(status)
                .note(request.getNote())
                .build();

        tool = toolRepository.save(tool);
        log.info("Created tool: {} - category: {}", tool.getName(), tool.getCategory());
        return toResponse(tool);
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
                        .map(this::toResponse)
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
        return toResponse(tool);
    }

    // ── Cập nhật CCDC ─────────────────────────────────────────
    @Transactional
    public ToolResponse updateTool(UUID toolId, ToolRequest request) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new NotFoundException("Tool", "id", toolId));

        validateQuantity(request);

        String status = calculateStatus(request.getAvailableQuantity());

        tool.setName(request.getName());
        tool.setCategory(request.getCategory());
        tool.setTotalQuantity(request.getTotalQuantity());
        tool.setAvailableQuantity(request.getAvailableQuantity());
        tool.setStatus(status);
        tool.setNote(request.getNote());

        tool = toolRepository.save(tool);
        log.info("Updated tool: {} - status: {}", tool.getName(), tool.getStatus());
        return toResponse(tool);
    }

    // ── Validate: availableQuantity <= totalQuantity ───────────
    private void validateQuantity(ToolRequest request) {
        if (request.getAvailableQuantity() > request.getTotalQuantity()) {
            throw new IllegalArgumentException(
                    "Số lượng khả dụng (" + request.getAvailableQuantity()
                            + ") không được lớn hơn tổng số lượng (" + request.getTotalQuantity() + ")");
        }
    }

    // ── Tính status tự động ───────────────────────────────────
    private String calculateStatus(int availableQuantity) {
        return availableQuantity == 0 ? "out" : "available";
    }

    // ── Helper: Map Entity → Response ─────────────────────────
    private ToolResponse toResponse(Tool tool) {
        return ToolResponse.builder()
                .toolId(tool.getToolId().toString())
                .name(tool.getName())
                .category(tool.getCategory())
                .totalQuantity(tool.getTotalQuantity())
                .availableQuantity(tool.getAvailableQuantity())
                .status(tool.getStatus())
                .note(tool.getNote())
                .build();
    }
}
