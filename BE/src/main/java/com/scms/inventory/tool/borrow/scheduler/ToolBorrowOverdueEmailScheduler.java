package com.scms.inventory.tool.borrow.scheduler;

import com.scms.common.entity.AuditLog;
import com.scms.common.repository.AuditLogRepository;
import com.scms.common.service.EmailService;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.inventory.tool.borrow.repository.ToolBorrowRepository;
import com.scms.inventory.tool.entity.Tool;
import com.scms.inventory.tool.entity.ToolBorrow;
import com.scms.inventory.tool.repository.ToolRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ToolBorrowOverdueEmailScheduler {

    ToolBorrowRepository toolBorrowRepository;
    EmployeeRepository employeeRepository;
    ToolRepository toolRepository;
    AuditLogRepository auditLogRepository;
    EmailService emailService;

    private static final String ACTION_EMAIL_SENT = "TOOL_BORROW_OVERDUE_EMAIL_SENT";

    /**
     * Chạy mỗi ngày lúc 08:00
     */
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendDailyOverdueEmails() {
        log.info("[EmailScheduler] Bắt đầu chạy daily job gửi email nhắc trả CCDC quá hạn...");
        List<ToolBorrow> overdueBorrows = toolBorrowRepository.findOverdueBorrowsNotReturned();
        processOverdueEmails(overdueBorrows);
        log.info("[EmailScheduler] Hoàn thành daily job gửi email.");
    }

    /**
     * Xử lý danh sách các phiếu mượn quá hạn và gửi email
     * Public để có thể gọi từ ToolBorrowOverdueScheduler khi phiếu vừa được đánh
     * dấu quá hạn.
     */
    public void processOverdueEmails(List<ToolBorrow> borrows) {
        if (borrows == null || borrows.isEmpty()) {
            return;
        }

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        // Gom nhóm phiếu mượn theo employee_id
        java.util.Map<java.util.UUID, List<ToolBorrow>> borrowsByEmployee = borrows.stream()
                .collect(java.util.stream.Collectors.groupingBy(ToolBorrow::getBorrowedBy));

        for (java.util.Map.Entry<java.util.UUID, List<ToolBorrow>> entry : borrowsByEmployee.entrySet()) {
            java.util.UUID employeeId = entry.getKey();
            List<ToolBorrow> employeeBorrows = entry.getValue();

            try {
                // Kiểm tra xem đã gửi email hôm nay cho nhân viên này chưa
                // Lần này chúng ta dùng TABLE_NAME="employee" và record_id=employeeId để theo
                // dõi
                // boolean alreadySentToday = auditLogRepository.existsByActionAndTableNameAndRecordIdAndCreatedAtBetween(
                //         ACTION_EMAIL_SENT,
                //         "employee",
                //         employeeId.toString(),
                //         startOfDay,
                //         endOfDay);

                // if (alreadySentToday) {
                //     continue; // Bỏ qua nếu đã gửi cho nhân viên này trong ngày
                // }

                // Lấy thông tin người mượn
                Employee employee = employeeRepository.findById(employeeId).orElse(null);
                if (employee == null || employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
                    log.warn("[EmailScheduler] Bỏ qua nhân viên {} vì không tìm thấy hoặc email trống.", employeeId);
                    continue;
                }

                // Gom thông tin CCDC
                java.util.List<EmailService.OverdueToolInfo> overdueItems = new java.util.ArrayList<>();
                for (ToolBorrow borrow : employeeBorrows) {
                    Tool tool = toolRepository.findById(borrow.getToolId()).orElse(null);
                    if (tool == null)
                        continue;

                    long overdueDays = 0;
                    if (borrow.getDueDate() != null) {
                        overdueDays = ChronoUnit.DAYS.between(borrow.getDueDate().toLocalDate(), LocalDate.now());
                        if (overdueDays < 0)
                            overdueDays = 0;
                    }

                    overdueItems.add(new EmailService.OverdueToolInfo(
                            tool.getName(), borrow.getRemainingQuantity(), borrow.getBorrowedAt(), borrow.getDueDate(),
                            overdueDays));
                }

                if (overdueItems.isEmpty())
                    continue;

                // Gửi email gộp
                if (overdueItems.size() == 1) {
                    // Nếu chỉ có 1, gửi template cũ cho gọn
                    EmailService.OverdueToolInfo single = overdueItems.get(0);
                    emailService.sendToolBorrowOverdueEmail(
                            employee.getEmail(), employee.getName(), single.toolName(), single.quantity(),
                            single.borrowDate(), single.dueDate(), single.overdueDays());
                } else {
                    // Gửi template gộp nhiều món
                    emailService.sendToolBorrowOverdueEmailMulti(
                            employee.getEmail(), employee.getName(), overdueItems);
                }

                // Ghi log
                String detailMsg = String.format(
                        "Đã tự động gửi email nhắc trả %d CCDC cho nhân viên '%s' (Email: %s).",
                        overdueItems.size(), employee.getName(), employee.getEmail());

                AuditLog logEntry = AuditLog.builder()
                        .action(ACTION_EMAIL_SENT)
                        .tableName("employee") // Đổi table_name thành employee để track theo ngày/nhân viên
                        .recordId(employeeId.toString())
                        .detail(detailMsg)
                        .createdAt(LocalDateTime.now())
                        .createdBy("SYSTEM_SCHEDULER")
                        .build();
                auditLogRepository.save(logEntry);

            } catch (Exception e) {
                log.error("[EmailScheduler] Lỗi khi xử lý email cho nhân viên {}: {}", employeeId,
                        e.getMessage(), e);
                // Không throw exception để tiếp tục xử lý các nhân viên khác
            }
        }
    }
}
