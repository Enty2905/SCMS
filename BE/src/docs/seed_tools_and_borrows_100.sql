-- ============================================================
-- SEED DATA: 100 CCDC + 100 PHIẾU MƯỢN/TRẢ CCDC
-- MySQL 8.x
--
-- Bảng sử dụng:
--   employee    : giữ nguyên dữ liệu
--   tool        : xóa dữ liệu cũ và tạo lại 100 dòng
--   tool_borrow : xóa dữ liệu cũ và tạo lại 100 dòng
--
-- Lưu ý: Cần có ít nhất 1 nhân viên trong bảng employee.
-- ============================================================

USE scms_db;

DROP PROCEDURE IF EXISTS seed_tools_and_borrows;

DELIMITER $$

CREATE PROCEDURE seed_tools_and_borrows()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE employee_count INT DEFAULT 0;
    DECLARE borrowable_tool_count INT DEFAULT 0;

    DECLARE v_tool_id BINARY(16);
    DECLARE v_employee_id BINARY(16);

    DECLARE v_total INT;
    DECLARE v_damaged INT;
    DECLARE v_available INT;
    DECLARE v_quantity INT;

    DECLARE v_tool_status VARCHAR(20);
    DECLARE v_borrow_status VARCHAR(20);

    DECLARE v_borrowed_at TIMESTAMP;
    DECLARE v_due_date TIMESTAMP;
    DECLARE v_returned_at TIMESTAMP;

    -- Kiểm tra dữ liệu nhân viên, tuyệt đối không xóa bảng employee.
    SELECT COUNT(*) INTO employee_count
    FROM employee;

    IF employee_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể tạo dữ liệu mượn CCDC vì bảng employee chưa có dữ liệu.';
    END IF;

    -- Xóa đúng thứ tự để tránh lỗi khóa ngoại.
    DELETE FROM tool_borrow;
    DELETE FROM tool;

    DROP TEMPORARY TABLE IF EXISTS tmp_seed_employee;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_tool;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_borrowable_tool;

    -- Đánh số nhân viên hiện có để phân bổ người mượn.
    CREATE TEMPORARY TABLE tmp_seed_employee AS
    SELECT
        ROW_NUMBER() OVER (ORDER BY employee_id) AS row_no,
        employee_id
    FROM employee;

    -- Lưu ID CCDC được tạo để dùng cho bảng mượn/trả.
    CREATE TEMPORARY TABLE tmp_seed_tool (
        seed_no INT PRIMARY KEY,
        tool_id BINARY(16) NOT NULL,
        is_borrowable BIT(1) NOT NULL
    );

    -- ========================================================
    -- 1. TẠO 100 CCDC
    -- ========================================================
    SET i = 1;

    WHILE i <= 100 DO
        SET v_tool_id = UUID_TO_BIN(UUID());
        SET v_total = 5 + MOD(i, 16);

        -- Mỗi CCDC thứ 20 được đặt ở trạng thái hỏng hoàn toàn.
        IF MOD(i, 20) = 0 THEN
            SET v_damaged = v_total;
            SET v_tool_status = 'damaged';
        ELSE
            SET v_damaged = MOD(i, 4);
            SET v_tool_status = 'available';
        END IF;

        SET v_available = v_total - v_damaged;

        INSERT INTO tool (
            tool_id,
            name,
            category,
            total_quantity,
            available_quantity,
            damaged_quantity,
            status,
            note,
            image_url,
            is_deleted
        )
        VALUES (
            v_tool_id,
            CONCAT(
                CASE MOD(i, 10)
                    WHEN 1 THEN 'Máy khoan điện'
                    WHEN 2 THEN 'Máy mài góc'
                    WHEN 3 THEN 'Bộ tua vít'
                    WHEN 4 THEN 'Kìm điện'
                    WHEN 5 THEN 'Đồng hồ vạn năng'
                    WHEN 6 THEN 'Thang nhôm'
                    WHEN 7 THEN 'Máy hàn'
                    WHEN 8 THEN 'Bộ cờ lê'
                    WHEN 9 THEN 'Máy cắt cầm tay'
                    ELSE 'Bộ dụng cụ bảo hộ'
                END,
                ' - ',
                LPAD(i, 3, '0')
            ),
            CASE MOD(i, 10)
                WHEN 1 THEN 'Thiết bị điện'
                WHEN 2 THEN 'Thiết bị cơ khí'
                WHEN 3 THEN 'Dụng cụ sửa chữa'
                WHEN 4 THEN 'Dụng cụ điện'
                WHEN 5 THEN 'Thiết bị đo'
                WHEN 6 THEN 'Thiết bị trên cao'
                WHEN 7 THEN 'Thiết bị hàn'
                WHEN 8 THEN 'Dụng cụ cơ khí'
                WHEN 9 THEN 'Thiết bị cắt'
                ELSE 'Bảo hộ lao động'
            END,
            v_total,
            v_available,
            v_damaged,
            v_tool_status,
            CONCAT('Dữ liệu mẫu CCDC số ', LPAD(i, 3, '0')),
            NULL,
            b'0'
        );

        INSERT INTO tmp_seed_tool (seed_no, tool_id, is_borrowable)
        VALUES (
            i,
            v_tool_id,
            IF(v_tool_status = 'available', b'1', b'0')
        );

        SET i = i + 1;
    END WHILE;

    -- Chỉ dùng CCDC chưa hỏng hoàn toàn để tạo lịch sử mượn/trả.
    CREATE TEMPORARY TABLE tmp_seed_borrowable_tool AS
    SELECT
        ROW_NUMBER() OVER (ORDER BY seed_no) AS row_no,
        tool_id
    FROM tmp_seed_tool
    WHERE is_borrowable = b'1';

    SELECT COUNT(*) INTO borrowable_tool_count
    FROM tmp_seed_borrowable_tool;

    -- ========================================================
    -- 2. TẠO 100 DÒNG MƯỢN/TRẢ CCDC
    -- Phân bố:
    --   50 dòng borrowing
    --   30 dòng returned
    --   20 dòng overdue
    -- ========================================================
    SET i = 1;

    WHILE i <= 100 DO
        SELECT employee_id
        INTO v_employee_id
        FROM tmp_seed_employee
        WHERE row_no = MOD(i - 1, employee_count) + 1;

        SELECT tool_id
        INTO v_tool_id
        FROM tmp_seed_borrowable_tool
        WHERE row_no = MOD(i - 1, borrowable_tool_count) + 1;

        SET v_quantity = 1 + MOD(i, 3);

        IF MOD(i, 10) < 5 THEN
            -- Đang mượn, chưa đến hạn.
            SET v_borrow_status = 'borrowing';
            SET v_borrowed_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL MOD(i, 5) DAY);
            SET v_due_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL (3 + MOD(i, 12)) DAY);
            SET v_returned_at = NULL;

        ELSEIF MOD(i, 10) < 8 THEN
            -- Đã trả.
            SET v_borrow_status = 'returned';
            SET v_borrowed_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (10 + MOD(i, 50)) DAY);
            SET v_due_date = DATE_ADD(v_borrowed_at, INTERVAL 7 DAY);
            SET v_returned_at = DATE_ADD(v_borrowed_at, INTERVAL (2 + MOD(i, 5)) DAY);

        ELSE
            -- Quá hạn và chưa trả.
            SET v_borrow_status = 'overdue';
            SET v_borrowed_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (15 + MOD(i, 30)) DAY);
            SET v_due_date = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (1 + MOD(i, 15)) DAY);
            SET v_returned_at = NULL;
        END IF;

        INSERT INTO tool_borrow (
            borrow_id,
            tool_id,
            borrowed_by,
            quantity,
            borrowed_at,
            due_date,
            returned_at,
            status,
            note
        )
        VALUES (
            UUID_TO_BIN(UUID()),
            v_tool_id,
            v_employee_id,
            v_quantity,
            v_borrowed_at,
            v_due_date,
            v_returned_at,
            v_borrow_status,
            CONCAT(
                'Dữ liệu mẫu mượn/trả CCDC số ',
                LPAD(i, 3, '0'),
                ' - trạng thái ',
                v_borrow_status
            )
        );

        SET i = i + 1;
    END WHILE;

    -- Cập nhật số lượng khả dụng theo các phiếu đang mượn hoặc quá hạn.
    UPDATE tool t
    LEFT JOIN (
        SELECT
            tool_id,
            SUM(quantity) AS active_borrow_quantity
        FROM tool_borrow
        WHERE status IN ('borrowing', 'overdue')
        GROUP BY tool_id
    ) b ON b.tool_id = t.tool_id
    SET t.available_quantity = GREATEST(
        t.total_quantity
        - t.damaged_quantity
        - COALESCE(b.active_borrow_quantity, 0),
        0
    );

    DROP TEMPORARY TABLE IF EXISTS tmp_seed_borrowable_tool;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_tool;
    DROP TEMPORARY TABLE IF EXISTS tmp_seed_employee;
END$$

DELIMITER ;

CALL seed_tools_and_borrows();

DROP PROCEDURE IF EXISTS seed_tools_and_borrows;

-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================
SELECT COUNT(*) AS total_tools
FROM tool;

SELECT
    status,
    COUNT(*) AS total
FROM tool
GROUP BY status;

SELECT COUNT(*) AS total_borrow_records
FROM tool_borrow;

SELECT
    status,
    COUNT(*) AS total
FROM tool_borrow
GROUP BY status;

SELECT COUNT(*) AS total_employees_unchanged
FROM employee;
