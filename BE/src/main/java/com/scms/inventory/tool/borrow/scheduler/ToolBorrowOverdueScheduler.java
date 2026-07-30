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

import com.scms.inventory.tool.entity.ToolBorrow;
import java.util.List;

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
    ToolBorrowOverdueEmailScheduler emailScheduler;

    /**
     * Chạy mỗi 1 phút để đánh dấu phiếu mượn quá hạn và gửi mail ngay.
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void markOverdueBorrows() {
        LocalDateTime now = LocalDateTime.now();
        // Lấy danh sách sắp bị quá hạn (trước khi update)
        List<ToolBorrow> newlyOverdue = toolBorrowRepository.findOverdueBorrows(now);
        
        int updated = toolBorrowRepository.markOverdue(now);
        if (updated > 0) {
            log.info("[Scheduler] Đã cập nhật {} phiếu mượn sang trạng thái 'overdue'", updated);
            
            // Gửi email ngay lập tức cho các phiếu vừa chuyển sang quá hạn
            if (!newlyOverdue.isEmpty()) {
                emailScheduler.processOverdueEmails(newlyOverdue);
            }
        }
    }
}
