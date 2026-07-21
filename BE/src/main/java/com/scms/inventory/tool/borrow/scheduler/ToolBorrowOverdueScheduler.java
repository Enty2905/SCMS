package com.scms.inventory.tool.borrow.scheduler;

import com.scms.inventory.tool.borrow.repository.ToolBorrowRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduler tự động cập nhật trạng thái phiếu mượn quá hạn.
 * Chạy mỗi 15 phút. Chỉ cập nhật status, không thay đổi availableQuantity.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ToolBorrowOverdueScheduler {

    ToolBorrowRepository toolBorrowRepository;

    /**
     * Chạy mỗi 15 phút để đánh dấu phiếu mượn quá hạn.
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void markOverdueBorrows() {
        LocalDateTime now = LocalDateTime.now();
        int updated = toolBorrowRepository.markOverdue(now);
        if (updated > 0) {
            log.info("[Scheduler] Đã cập nhật {} phiếu mượn sang trạng thái 'overdue'", updated);
        }
    }
}
