package com.scms.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tự động dọn dẹp các constraint cũ trong DB khi ứng dụng khởi động.
 * File này là THÊM MỚI, không sửa bất kỳ file nào khác.
 *
 * Lý do: Bảng work_order_daily_log ban đầu có unique constraint (uq_work_order_date)
 * giới hạn 1 ngày chỉ có 1 lần mở/đóng nhật ký, không đúng với thực tế vận hành nhà máy.
 * Constraint này cần được gỡ bỏ để Trưởng ca có thể mở/đóng nhiều lần trong ngày.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseMigrationConfig implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        dropWorkOrderDateUniqueConstraint();
    }

    private void dropWorkOrderDateUniqueConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE work_order_daily_log DROP INDEX uq_work_order_date");
            log.info("[Migration] Đã gỡ bỏ constraint 'uq_work_order_date' khỏi bảng work_order_daily_log.");
        } catch (Exception e) {
            // Constraint không tồn tại hoặc đã được gỡ trước đó → bình thường, bỏ qua
            log.debug("[Migration] Constraint 'uq_work_order_date' không tồn tại hoặc đã được gỡ trước đó.");
        }
    }
}
