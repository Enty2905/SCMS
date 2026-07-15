package com.scms.inventory.tool.borrow.service;

import com.scms.common.exception.BadRequestException;
import com.scms.common.exception.NotFoundException;
import com.scms.common.response.PagedResponse;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.inventory.tool.borrow.dto.request.ToolBorrowRequest;
import com.scms.inventory.tool.borrow.dto.response.ToolBorrowResponse;
import com.scms.inventory.tool.borrow.repository.ToolBorrowRepository;
import com.scms.inventory.tool.entity.Tool;
import com.scms.inventory.tool.entity.ToolBorrow;
import com.scms.inventory.tool.repository.ToolRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ToolBorrowService {

    ToolBorrowRepository toolBorrowRepository;
    ToolRepository toolRepository;
    EmployeeRepository employeeRepository;

    // ── Tạo phiếu mượn ────────────────────────────────────────
    @Transactional
    public ToolBorrowResponse createBorrow(ToolBorrowRequest request) {
        Tool tool = toolRepository.findById(request.getToolId())
                .orElseThrow(() -> new NotFoundException("Tool", "id", request.getToolId()));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee", "id", request.getEmployeeId()));

        // Kiểm tra số lượng
        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng mượn phải > 0");
        }
        if (request.getQuantity() > tool.getAvailableQuantity()) {
            throw new BadRequestException(
                    "Số lượng mượn (" + request.getQuantity() +
                    ") vượt quá số lượng khả dụng (" + tool.getAvailableQuantity() + ")");
        }

        // Kiểm tra hạn trả
        if (request.getDueDate() == null || !request.getDueDate().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Hạn trả phải sau thời điểm hiện tại");
        }

        // Tạo phiếu mượn
        ToolBorrow borrow = ToolBorrow.builder()
                .toolId(tool.getToolId())
                .borrowedBy(employee.getEmployeeId())
                .quantity(request.getQuantity())
                .borrowedAt(LocalDateTime.now())
                .dueDate(request.getDueDate())
                .returnedAt(null)
                .status("borrowing")
                .note(request.getNote())
                .build();

        borrow = toolBorrowRepository.save(borrow);

        // Giảm availableQuantity
        tool.setAvailableQuantity(tool.getAvailableQuantity() - request.getQuantity());
        toolRepository.save(tool);

        log.info("Created borrow: tool={}, employee={}, qty={}", tool.getName(), employee.getName(), request.getQuantity());
        return toResponse(borrow, tool, employee);
    }

    // ── Lấy danh sách phiếu mượn ─────────────────────────────
    public PagedResponse<ToolBorrowResponse> getBorrows(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String st = (status != null && !status.isBlank()) ? status.trim() : null;

        Page<ToolBorrow> borrows = toolBorrowRepository.searchBorrows(kw, st, pageable);

        return PagedResponse.<ToolBorrowResponse>builder()
                .content(borrows.getContent().stream()
                        .map(b -> {
                            Tool tool = toolRepository.findById(b.getToolId()).orElse(null);
                            Employee employee = employeeRepository.findById(b.getBorrowedBy()).orElse(null);
                            return toResponse(b, tool, employee);
                        })
                        .toList())
                .page(borrows.getNumber())
                .size(borrows.getSize())
                .totalElements(borrows.getTotalElements())
                .totalPages(borrows.getTotalPages())
                .last(borrows.isLast())
                .build();
    }

    // ── Lấy chi tiết phiếu mượn ──────────────────────────────
    public ToolBorrowResponse getBorrowById(UUID borrowId) {
        ToolBorrow borrow = toolBorrowRepository.findById(borrowId)
                .orElseThrow(() -> new NotFoundException("ToolBorrow", "id", borrowId));

        Tool tool = toolRepository.findById(borrow.getToolId()).orElse(null);
        Employee employee = employeeRepository.findById(borrow.getBorrowedBy()).orElse(null);
        return toResponse(borrow, tool, employee);
    }

    // ── Xác nhận trả CCDC ─────────────────────────────────────
    @Transactional
    public ToolBorrowResponse returnBorrow(UUID borrowId) {
        ToolBorrow borrow = toolBorrowRepository.findById(borrowId)
                .orElseThrow(() -> new NotFoundException("ToolBorrow", "id", borrowId));

        if ("returned".equals(borrow.getStatus())) {
            throw new BadRequestException("Phiếu mượn này đã được trả, không thể trả lại.");
        }
        if (!"borrowing".equals(borrow.getStatus()) && !"overdue".equals(borrow.getStatus())) {
            throw new BadRequestException("Chỉ có thể trả phiếu có trạng thái 'borrowing' hoặc 'overdue'.");
        }

        Tool tool = toolRepository.findById(borrow.getToolId())
                .orElseThrow(() -> new NotFoundException("Tool", "id", borrow.getToolId()));

        // Cộng lại availableQuantity, không vượt totalQuantity - damagedQuantity
        int maxAvailable = tool.getTotalQuantity() - tool.getDamagedQuantity();
        int newAvailable = Math.min(tool.getAvailableQuantity() + borrow.getQuantity(), maxAvailable);
        tool.setAvailableQuantity(newAvailable);
        toolRepository.save(tool);

        borrow.setReturnedAt(LocalDateTime.now());
        borrow.setStatus("returned");
        final ToolBorrow saved = toolBorrowRepository.save(borrow);

        Employee employee = employeeRepository.findById(saved.getBorrowedBy()).orElse(null);
        log.info("Returned borrow: borrowId={}, tool={}, qty={}", borrowId, tool.getName(), saved.getQuantity());
        return toResponse(saved, tool, employee);
    }

    // ── Helper: Map to Response ───────────────────────────────
    private ToolBorrowResponse toResponse(ToolBorrow borrow, Tool tool, Employee employee) {
        long overdueDays = 0;
        if (borrow.getDueDate() != null) {
            LocalDateTime reference = (borrow.getReturnedAt() != null)
                    ? borrow.getReturnedAt()
                    : LocalDateTime.now();
            overdueDays = ChronoUnit.DAYS.between(borrow.getDueDate(), reference);
            if (overdueDays < 0) overdueDays = 0;
        }

        return ToolBorrowResponse.builder()
                .borrowId(borrow.getBorrowId() != null ? borrow.getBorrowId().toString() : null)
                .toolId(borrow.getToolId() != null ? borrow.getToolId().toString() : null)
                .toolName(tool != null ? tool.getName() : null)
                .employeeId(borrow.getBorrowedBy() != null ? borrow.getBorrowedBy().toString() : null)
                .employeeName(employee != null ? employee.getName() : null)
                .employeePhone(employee != null ? employee.getPhone() : null)
                .quantity(borrow.getQuantity())
                .borrowedAt(borrow.getBorrowedAt())
                .dueDate(borrow.getDueDate())
                .returnedAt(borrow.getReturnedAt())
                .status(borrow.getStatus())
                .note(borrow.getNote())
                .overdueDays(overdueDays)
                .build();
    }
}
