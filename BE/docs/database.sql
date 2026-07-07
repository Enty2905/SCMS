-- ============================================================
-- SCMS - Supply Chain Management System
-- MySQL 8.x Schema + Seed Data
-- UUID storage policy: BINARY(16) to match Hibernate UUID binary mapping
-- IMPORTANT: Run on a fresh development database.
-- If you already created the old CHAR(36) schema, run first:
--   DROP DATABASE scms_db;
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS scms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE scms_db;

-- ============================================================
-- 1. AUTH & NHÂN SỰ
-- ============================================================

CREATE TABLE `role` (
  `role_id`     BINARY(16)   NOT NULL,
  `role_name`   VARCHAR(100) NOT NULL,
  `role_code`   VARCHAR(50)  NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `department` (
  `department_id`   BINARY(16)   NOT NULL,
  `department_name` VARCHAR(150) NOT NULL,
  `department_code` VARCHAR(50)  NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uq_department_code` (`department_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee_position` (
  `position_id`   BINARY(16)   NOT NULL,
  `position_name` VARCHAR(150) NOT NULL,
  `description`   TEXT         NULL,
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `uq_position_name` (`position_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee` (
  `employee_id`   BINARY(16)   NOT NULL,
  `name`          VARCHAR(150) NOT NULL,
  `phone`         VARCHAR(20)  NULL,
  `avatar_url`    VARCHAR(500) NULL,
  `department_id` BINARY(16)   NULL,
  `position_id`   BINARY(16)   NULL COMMENT 'Chức vụ: tổ trưởng, kỹ thuật viên, thủ kho...',
  `work_location` VARCHAR(200) NULL COMMENT 'Vị trí/nơi làm việc: PXVH, PXSC, kho vật tư...',
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `fk_employee_department`
    FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_employee_position`
    FOREIGN KEY (`position_id`) REFERENCES `employee_position` (`position_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee_role` (
  `id`          BINARY(16)  NOT NULL,
  `employee_id` BINARY(16)  NOT NULL,
  `role_id`     BINARY(16)  NOT NULL,
  `assigned_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_role` (`employee_id`, `role_id`),
  CONSTRAINT `fk_erole_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_erole_role`
    FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `user_id`       BINARY(16)   NOT NULL,
  `username`      VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `employee_id`   BINARY(16)   NOT NULL COMMENT 'Tài khoản phải gắn với một nhân viên',
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_employee` (`employee_id`),
  CONSTRAINT `fk_user_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. THIẾT BỊ
-- ============================================================

CREATE TABLE `equipment_system` (
  `system_id`        BINARY(16)   NOT NULL,
  `system_name`      VARCHAR(200) NOT NULL,
  `system_code`      VARCHAR(50)  NULL,
  `description`      TEXT         NULL,
  `parent_system_id` BINARY(16)   NULL COMMENT 'Hệ thống cha nếu có phân cấp',
  PRIMARY KEY (`system_id`),
  UNIQUE KEY `uq_system_code` (`system_code`),
  CONSTRAINT `fk_system_parent`
    FOREIGN KEY (`parent_system_id`) REFERENCES `equipment_system` (`system_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `equipment` (
  `equipment_id` BINARY(16)   NOT NULL,
  `kks_code`     VARCHAR(100) NOT NULL COMMENT 'Mã định danh theo tiêu chuẩn KKS',
  `name`         VARCHAR(200) NOT NULL,
  `type`         VARCHAR(100) NOT NULL COMMENT 'Cơ khí | Điện | CI',
  `status`       VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | inactive | maintenance | broken',
  `location`     VARCHAR(200) NULL COMMENT 'Vị trí lắp đặt trong nhà máy',
  `system_id`    BINARY(16)   NULL,
  PRIMARY KEY (`equipment_id`),
  UNIQUE KEY `uq_equipment_kks` (`kks_code`),
  CONSTRAINT `fk_equipment_system`
    FOREIGN KEY (`system_id`) REFERENCES `equipment_system` (`system_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `equipment_image` (
  `image_id`     BINARY(16)   NOT NULL,
  `equipment_id` BINARY(16)   NOT NULL,
  `image_url`    VARCHAR(500) NOT NULL,
  `caption`      VARCHAR(255) NULL COMMENT 'Mô tả ảnh: góc chụp, vị trí, tình trạng...',
  `uploaded_by`  BINARY(16)   NULL,
  `uploaded_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  CONSTRAINT `fk_image_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_image_user`
    FOREIGN KEY (`uploaded_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `technical_param` (
  `param_id`   BINARY(16)   NOT NULL,
  `param_name` VARCHAR(150) NOT NULL COMMENT 'VD: Lưu lượng, Áp suất, Model, Serial, Năm SX...',
  `data_type`  VARCHAR(30)  NOT NULL DEFAULT 'text' COMMENT 'text | number | date',
  PRIMARY KEY (`param_id`),
  UNIQUE KEY `uq_param_name` (`param_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `unit` (
  `unit_id`   BINARY(16)   NOT NULL,
  `symbol`    VARCHAR(50)  NOT NULL COMMENT 'VD: kW, bar, m3/h, rpm, V, A...',
  `full_name` VARCHAR(100) NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `uq_unit_symbol` (`symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `technical_spec` (
  `spec_id`      BINARY(16)   NOT NULL,
  `equipment_id` BINARY(16)   NOT NULL,
  `param_id`     BINARY(16)   NOT NULL,
  `param_value`  VARCHAR(255) NULL COMMENT 'Lưu dạng text để linh hoạt',
  `unit_id`      BINARY(16)   NULL COMMENT 'Null nếu không có đơn vị (VD: Model, Serial)',
  PRIMARY KEY (`spec_id`),
  CONSTRAINT `fk_spec_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_spec_param`
    FOREIGN KEY (`param_id`) REFERENCES `technical_param` (`param_id`),
  CONSTRAINT `fk_spec_unit`
    FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. YÊU CẦU SỬA CHỮA & PHIẾU CÔNG TÁC
-- ============================================================

CREATE TABLE `repair_request` (
  `request_id`   BINARY(16)  NOT NULL,
  `equipment_id` BINARY(16)  NOT NULL COMMENT 'Một request chỉ gắn với một thiết bị',
  `created_by`   BINARY(16)  NOT NULL COMMENT 'User tạo request',
  `description`  TEXT        NOT NULL,
  `priority`     VARCHAR(20) NOT NULL DEFAULT 'medium' COMMENT 'low | medium | high | critical',
  `status`       VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending | confirmed | in_progress | done | cancelled',
  `created_at`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  CONSTRAINT `fk_request_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_request_user`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `work_order` (
  `order_id`             BINARY(16)  NOT NULL,
  `order_number`         VARCHAR(50) NOT NULL COMMENT 'Số phiếu công tác',
  `request_id`           BINARY(16)  NULL COMMENT 'PCT có thể liên kết request hoặc tạo độc lập',
  `content`              TEXT        NULL,
  `status`               VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft | open | extended | locked',
  `start_date`           TIMESTAMP   NULL,
  `end_date`             TIMESTAMP   NULL,
  `extended_to`          TIMESTAMP   NULL,
  `work_leader_id`       BINARY(16)  NULL COMMENT 'Người lãnh đạo công việc - employee',
  `direct_commander_id`  BINARY(16)  NULL COMMENT 'Người chỉ huy trực tiếp - employee',
  `safety_supervisor_id` BINARY(16)  NULL COMMENT 'Người giám sát an toàn - employee',
  `created_by`           BINARY(16)  NULL COMMENT 'User tạo phiếu công tác',
  `created_at`           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  CONSTRAINT `fk_order_request`
    FOREIGN KEY (`request_id`) REFERENCES `repair_request` (`request_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_order_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_order_leader`
    FOREIGN KEY (`work_leader_id`) REFERENCES `employee` (`employee_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_order_commander`
    FOREIGN KEY (`direct_commander_id`) REFERENCES `employee` (`employee_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_order_supervisor`
    FOREIGN KEY (`safety_supervisor_id`) REFERENCES `employee` (`employee_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `work_order_daily_log` (
  `log_id`    BINARY(16) NOT NULL,
  `order_id`  BINARY(16) NOT NULL,
  `date`      DATE       NOT NULL COMMENT 'Ngày làm việc',
  `opened_by` BINARY(16) NOT NULL COMMENT 'User mở phiếu trong ngày',
  `opened_at` TIMESTAMP  NOT NULL,
  `closed_by` BINARY(16) NULL COMMENT 'User đóng phiếu, null nếu chưa đóng',
  `closed_at` TIMESTAMP  NULL COMMENT 'Thời điểm đóng phiếu, null nếu chưa đóng',
  `note`      TEXT       NULL,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `fk_daily_log_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_daily_log_opened`
    FOREIGN KEY (`opened_by`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_daily_log_closed`
    FOREIGN KEY (`closed_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `work_order_member` (
  `id`           BINARY(16) NOT NULL,
  `order_id`     BINARY(16) NOT NULL,
  `employee_id`  BINARY(16) NOT NULL,
  `check_in_at`  TIMESTAMP  NULL COMMENT 'Giờ vào phiếu',
  `check_out_at` TIMESTAMP  NULL COMMENT 'Giờ ra phiếu',
  `added_at`     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_member_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_member_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `repair_history` (
  `history_id`   BINARY(16) NOT NULL,
  `equipment_id` BINARY(16) NOT NULL,
  `order_id`     BINARY(16) NULL,
  `description`  TEXT       NULL,
  `repaired_at`  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repaired_by`  BINARY(16) NULL COMMENT 'User ghi nhận lịch sử sửa chữa',
  PRIMARY KEY (`history_id`),
  CONSTRAINT `fk_history_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_history_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_history_user`
    FOREIGN KEY (`repaired_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. BIÊN BẢN ĐÁNH GIÁ KỸ THUẬT
-- ============================================================

CREATE TABLE `technical_assessment` (
  `assessment_id`       BINARY(16)   NOT NULL,
  `equipment_id`        BINARY(16)   NOT NULL,
  `damage_description`  TEXT         NULL,
  `proposed_action`     TEXT         NULL,
  `repair_signed_by`    BINARY(16)   NULL COMMENT 'Nhân viên bên sửa chữa ký',
  `repair_signed_at`    TIMESTAMP    NULL,
  `operation_signed_by` BINARY(16)   NULL COMMENT 'Nhân viên bên vận hành ký',
  `operation_signed_at` TIMESTAMP    NULL,
  `pdf_url`             VARCHAR(500) NULL COMMENT 'File PDF biên bản đã ký',
  `created_by`          BINARY(16)   NOT NULL COMMENT 'Employee tạo biên bản',
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assessment_id`),
  CONSTRAINT `fk_assessment_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`),
  CONSTRAINT `fk_assessment_created`
    FOREIGN KEY (`created_by`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `fk_assessment_repair_sign`
    FOREIGN KEY (`repair_signed_by`) REFERENCES `employee` (`employee_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_assessment_op_sign`
    FOREIGN KEY (`operation_signed_by`) REFERENCES `employee` (`employee_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5A. VẬT TƯ TIÊU HAO
-- Tồn kho = SUM(import) - SUM(export), không dùng bảng stock
-- ============================================================

CREATE TABLE `consumable` (
  `consumable_id` BINARY(16)   NOT NULL,
  `code`          VARCHAR(50)  NOT NULL,
  `name`          VARCHAR(200) NOT NULL,
  `unit`          VARCHAR(50)  NULL,
  `min_quantity`  INT          NOT NULL DEFAULT 0 COMMENT 'Ngưỡng cảnh báo tồn kho thấp',
  `note`          TEXT         NULL,
  PRIMARY KEY (`consumable_id`),
  UNIQUE KEY `uq_consumable_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_request` (
  `req_id`     BINARY(16)   NOT NULL,
  `req_number` VARCHAR(50)  NULL,
  `order_id`   BINARY(16)   NULL COMMENT 'Phiếu công tác liên quan',
  `status`     VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | issued | rejected',
  `pdf_url`    VARCHAR(500) NULL,
  `created_by` BINARY(16)   NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`req_id`),
  UNIQUE KEY `uq_consumable_req_number` (`req_number`),
  CONSTRAINT `fk_creq_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_creq_user`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_request_item` (
  `item_id`            BINARY(16) NOT NULL,
  `req_id`             BINARY(16) NOT NULL,
  `consumable_id`      BINARY(16) NOT NULL,
  `quantity_requested` INT        NOT NULL DEFAULT 0,
  `quantity_issued`    INT        NOT NULL DEFAULT 0,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_creq_item_req`
    FOREIGN KEY (`req_id`) REFERENCES `consumable_request` (`req_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_creq_item_consumable`
    FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_import` (
  `import_id`     BINARY(16)  NOT NULL,
  `import_number` VARCHAR(50) NOT NULL,
  `imported_by`   BINARY(16)  NULL,
  `imported_at`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note`          TEXT        NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `uq_consumable_import_number` (`import_number`),
  CONSTRAINT `fk_cimport_user`
    FOREIGN KEY (`imported_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_import_item` (
  `item_id`       BINARY(16) NOT NULL,
  `import_id`     BINARY(16) NOT NULL,
  `consumable_id` BINARY(16) NOT NULL,
  `quantity`      INT        NOT NULL,
  `note`          TEXT       NULL,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_cimport_item_import`
    FOREIGN KEY (`import_id`) REFERENCES `consumable_import` (`import_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cimport_item_consumable`
    FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_export` (
  `export_id`     BINARY(16)  NOT NULL,
  `export_number` VARCHAR(50) NOT NULL,
  `req_id`        BINARY(16)  NULL COMMENT 'Phiếu yêu cầu, có thể null',
  `order_id`      BINARY(16)  NULL COMMENT 'PCT liên quan, có thể null',
  `exported_by`   BINARY(16)  NULL,
  `exported_at`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note`          TEXT        NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `uq_consumable_export_number` (`export_number`),
  CONSTRAINT `fk_cexport_req`
    FOREIGN KEY (`req_id`) REFERENCES `consumable_request` (`req_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_cexport_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_cexport_user`
    FOREIGN KEY (`exported_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consumable_export_item` (
  `item_id`       BINARY(16) NOT NULL,
  `export_id`     BINARY(16) NOT NULL,
  `consumable_id` BINARY(16) NOT NULL,
  `quantity`      INT        NOT NULL,
  `note`          TEXT       NULL,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_cexport_item_export`
    FOREIGN KEY (`export_id`) REFERENCES `consumable_export` (`export_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cexport_item_consumable`
    FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5B. VẬT TƯ THAY THẾ
-- Tồn kho = SUM(import) - SUM(export), không dùng bảng stock
-- ============================================================

CREATE TABLE `spare_part` (
  `spare_part_id` BINARY(16)   NOT NULL,
  `code`          VARCHAR(50)  NOT NULL,
  `name`          VARCHAR(200) NOT NULL,
  `unit`          VARCHAR(50)  NULL,
  `min_quantity`  INT          NOT NULL DEFAULT 0 COMMENT 'Ngưỡng cảnh báo tồn kho thấp',
  `note`          TEXT         NULL,
  PRIMARY KEY (`spare_part_id`),
  UNIQUE KEY `uq_spare_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_request` (
  `req_id`     BINARY(16)   NOT NULL,
  `req_number` VARCHAR(50)  NULL,
  `order_id`   BINARY(16)   NULL COMMENT 'Phiếu công tác liên quan',
  `status`     VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | issued | rejected',
  `pdf_url`    VARCHAR(500) NULL,
  `created_by` BINARY(16)   NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`req_id`),
  UNIQUE KEY `uq_spare_req_number` (`req_number`),
  CONSTRAINT `fk_sreq_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_sreq_user`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_request_item` (
  `item_id`            BINARY(16) NOT NULL,
  `req_id`             BINARY(16) NOT NULL,
  `spare_part_id`      BINARY(16) NOT NULL,
  `quantity_requested` INT        NOT NULL DEFAULT 0,
  `quantity_issued`    INT        NOT NULL DEFAULT 0,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_sreq_item_req`
    FOREIGN KEY (`req_id`) REFERENCES `spare_part_request` (`req_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_sreq_item_spare`
    FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_import` (
  `import_id`     BINARY(16)  NOT NULL,
  `import_number` VARCHAR(50) NOT NULL,
  `imported_by`   BINARY(16)  NULL,
  `imported_at`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note`          TEXT        NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `uq_spare_import_number` (`import_number`),
  CONSTRAINT `fk_simport_user`
    FOREIGN KEY (`imported_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_import_item` (
  `item_id`       BINARY(16) NOT NULL,
  `import_id`     BINARY(16) NOT NULL,
  `spare_part_id` BINARY(16) NOT NULL,
  `quantity`      INT        NOT NULL,
  `note`          TEXT       NULL,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_simport_item_import`
    FOREIGN KEY (`import_id`) REFERENCES `spare_part_import` (`import_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_simport_item_spare`
    FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_export` (
  `export_id`     BINARY(16)  NOT NULL,
  `export_number` VARCHAR(50) NOT NULL,
  `req_id`        BINARY(16)  NULL COMMENT 'Phiếu yêu cầu, có thể null',
  `order_id`      BINARY(16)  NULL COMMENT 'PCT liên quan, có thể null',
  `exported_by`   BINARY(16)  NULL,
  `exported_at`   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note`          TEXT        NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `uq_spare_export_number` (`export_number`),
  CONSTRAINT `fk_sexport_req`
    FOREIGN KEY (`req_id`) REFERENCES `spare_part_request` (`req_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_sexport_order`
    FOREIGN KEY (`order_id`) REFERENCES `work_order` (`order_id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_sexport_user`
    FOREIGN KEY (`exported_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `spare_part_export_item` (
  `item_id`       BINARY(16) NOT NULL,
  `export_id`     BINARY(16) NOT NULL,
  `spare_part_id` BINARY(16) NOT NULL,
  `quantity`      INT        NOT NULL,
  `note`          TEXT       NULL,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_sexport_item_export`
    FOREIGN KEY (`export_id`) REFERENCES `spare_part_export` (`export_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_sexport_item_spare`
    FOREIGN KEY (`spare_part_id`) REFERENCES `spare_part` (`spare_part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. CÔNG CỤ DỤNG CỤ (CCDC)
-- ============================================================

CREATE TABLE `tool` (
  `tool_id`            BINARY(16)   NOT NULL,
  `name`               VARCHAR(200) NOT NULL,
  `category`           VARCHAR(100) NULL,
  `total_quantity`     INT          NOT NULL DEFAULT 0,
  `available_quantity` INT          NOT NULL DEFAULT 0,
  `status`             VARCHAR(20)  NOT NULL DEFAULT 'available' COMMENT 'available | low | out',
  `note`               TEXT         NULL,
  PRIMARY KEY (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tool_borrow` (
  `borrow_id`   BINARY(16) NOT NULL,
  `tool_id`     BINARY(16) NOT NULL,
  `borrowed_by` BINARY(16) NOT NULL COMMENT 'Employee mượn công cụ',
  `quantity`    INT        NOT NULL DEFAULT 1,
  `borrowed_at` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date`    TIMESTAMP  NULL,
  `returned_at` TIMESTAMP  NULL,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'borrowing' COMMENT 'borrowing | returned | overdue',
  `note`        TEXT       NULL,
  PRIMARY KEY (`borrow_id`),
  CONSTRAINT `fk_borrow_tool`
    FOREIGN KEY (`tool_id`) REFERENCES `tool` (`tool_id`),
  CONSTRAINT `fk_borrow_employee`
    FOREIGN KEY (`borrowed_by`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. AUDIT LOG
-- ============================================================

CREATE TABLE `audit_log` (
  `log_id`     BINARY(16)   NOT NULL,
  `user_id`    BINARY(16)   NULL,
  `action`     VARCHAR(100) NOT NULL COMMENT 'LOGIN | CREATE | UPDATE | DELETE...',
  `table_name` VARCHAR(100) NULL,
  `record_id`  BINARY(16)   NULL,
  `detail`     TEXT         NULL,
  `ip_address` VARCHAR(45)  NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `fk_audit_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX `idx_employee_dept`       ON `employee` (`department_id`);
CREATE INDEX `idx_equipment_kks`       ON `equipment` (`kks_code`);
CREATE INDEX `idx_equipment_status`    ON `equipment` (`status`);
CREATE INDEX `idx_equipment_system`    ON `equipment` (`system_id`);
CREATE INDEX `idx_equipment_type`      ON `equipment` (`type`);
CREATE INDEX `idx_spec_equipment`      ON `technical_spec` (`equipment_id`);
CREATE INDEX `idx_request_status`      ON `repair_request` (`status`);
CREATE INDEX `idx_request_equipment`   ON `repair_request` (`equipment_id`);
CREATE INDEX `idx_order_status`        ON `work_order` (`status`);
CREATE INDEX `idx_order_number`        ON `work_order` (`order_number`);
CREATE INDEX `idx_daily_log_date`      ON `work_order_daily_log` (`date`);
CREATE INDEX `idx_daily_log_order`     ON `work_order_daily_log` (`order_id`);
CREATE INDEX `idx_creq_status`         ON `consumable_request` (`status`);
CREATE INDEX `idx_sreq_status`         ON `spare_part_request` (`status`);
CREATE INDEX `idx_borrow_status`       ON `tool_borrow` (`status`);
CREATE INDEX `idx_borrow_due`          ON `tool_borrow` (`due_date`);
CREATE INDEX `idx_audit_user`          ON `audit_log` (`user_id`);
CREATE INDEX `idx_audit_created`       ON `audit_log` (`created_at`);
CREATE INDEX `idx_audit_action`        ON `audit_log` (`action`);

-- ============================================================
-- SEED DATA - MASTER DATA
-- ============================================================

-- 9 Roles
INSERT INTO `role` (`role_id`, `role_name`, `role_code`, `description`) VALUES
(UUID_TO_BIN(UUID()), 'Admin',                              'ADMIN',          'Toàn quyền hệ thống'),
(UUID_TO_BIN(UUID()), 'Nhân sự',                            'HR',             'Quản lý phòng ban và nhân viên'),
(UUID_TO_BIN(UUID()), 'Thủ kho vật tư',                     'WAREHOUSE_MAT',  'Nhập xuất tồn kho vật tư'),
(UUID_TO_BIN(UUID()), 'Thủ kho CCDC',                       'WAREHOUSE_TOOL', 'Quản lý công cụ dụng cụ'),
(UUID_TO_BIN(UUID()), 'Quản đốc / Kỹ thuật viên vận hành', 'OPS_MANAGER',    'Quản lý thiết bị và hệ thống'),
(UUID_TO_BIN(UUID()), 'Trưởng Ca / Trưởng Kíp vận hành',   'SHIFT_LEADER',   'Tạo yêu cầu sửa chữa, mở/đóng PCT'),
(UUID_TO_BIN(UUID()), 'Quản đốc sửa chữa',                  'REPAIR_MANAGER', 'Tiếp nhận yêu cầu, tạo phiếu công tác'),
(UUID_TO_BIN(UUID()), 'Tổ trưởng sửa chữa',                 'TEAM_LEADER',    'Lập biên bản đánh giá, quản lý bảo dưỡng'),
(UUID_TO_BIN(UUID()), 'Người dùng',                         'USER',           'Đăng nhập cơ bản')
ON DUPLICATE KEY UPDATE
  role_name = VALUES(role_name),
  description = VALUES(description);

-- Chức vụ mẫu
INSERT INTO `employee_position` (`position_id`, `position_name`, `description`) VALUES
(UUID_TO_BIN(UUID()), 'Quản đốc',         'Quản đốc phân xưởng'),
(UUID_TO_BIN(UUID()), 'Tổ trưởng',        'Tổ trưởng tổ sửa chữa'),
(UUID_TO_BIN(UUID()), 'Kỹ thuật viên',    'Kỹ thuật viên vận hành'),
(UUID_TO_BIN(UUID()), 'Trưởng Ca',        'Trưởng ca vận hành'),
(UUID_TO_BIN(UUID()), 'Thủ kho',          'Thủ kho vật tư / CCDC'),
(UUID_TO_BIN(UUID()), 'Nhân viên nhân sự','Phòng nhân sự')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

-- Phòng ban mẫu
INSERT INTO `department` (`department_id`, `department_name`, `department_code`) VALUES
(UUID_TO_BIN(UUID()), 'Phân xưởng vận hành',  'PXVH'),
(UUID_TO_BIN(UUID()), 'Phân xưởng sửa chữa',  'PXSC'),
(UUID_TO_BIN(UUID()), 'Phòng kế hoạch vật tư','KHVT'),
(UUID_TO_BIN(UUID()), 'Phòng nhân sự',        'NS')
ON DUPLICATE KEY UPDATE
  department_name = VALUES(department_name);

-- Technical param mẫu
INSERT INTO `technical_param` (`param_id`, `param_name`, `data_type`) VALUES
(UUID_TO_BIN(UUID()), 'Model',              'text'),
(UUID_TO_BIN(UUID()), 'Số serial',          'text'),
(UUID_TO_BIN(UUID()), 'Năm sản xuất',       'number'),
(UUID_TO_BIN(UUID()), 'Ngày lắp đặt',       'date'),
(UUID_TO_BIN(UUID()), 'Nhà sản xuất',       'text'),
(UUID_TO_BIN(UUID()), 'Lưu lượng định mức', 'number'),
(UUID_TO_BIN(UUID()), 'Áp suất đầu ra',     'number'),
(UUID_TO_BIN(UUID()), 'Công suất động cơ',  'number'),
(UUID_TO_BIN(UUID()), 'Tốc độ quay',        'number'),
(UUID_TO_BIN(UUID()), 'Điện áp',            'number'),
(UUID_TO_BIN(UUID()), 'Cường độ dòng điện', 'number')
ON DUPLICATE KEY UPDATE
  data_type = VALUES(data_type);

-- Unit mẫu
INSERT INTO `unit` (`unit_id`, `symbol`, `full_name`) VALUES
(UUID_TO_BIN(UUID()), 'm³/h', 'Mét khối trên giờ'),
(UUID_TO_BIN(UUID()), 'MPa',  'Megapascal'),
(UUID_TO_BIN(UUID()), 'kW',   'Kilowatt'),
(UUID_TO_BIN(UUID()), 'MW',   'Megawatt'),
(UUID_TO_BIN(UUID()), 'rpm',  'Vòng trên phút'),
(UUID_TO_BIN(UUID()), 'kV',   'Kilovolt'),
(UUID_TO_BIN(UUID()), 'V',    'Volt'),
(UUID_TO_BIN(UUID()), 'A',    'Ampere'),
(UUID_TO_BIN(UUID()), 'Hz',   'Hertz'),
(UUID_TO_BIN(UUID()), 'bar',  'Bar'),
(UUID_TO_BIN(UUID()), 'mm',   'Milimét')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name);

-- ============================================================
-- SEED TEST ACCOUNTS: 9 ROLE
-- Mật khẩu chung môi trường dev: password
-- BCrypt hash tương ứng: password
-- ============================================================

SET @default_password = '$2y$10$u5KVN.rExP0GfkhMWISxX.eYcRRydy0MvB88siTkcxdUWVaY177.C';

-- 1. Tạo 9 nhân viên test
INSERT INTO `employee`
(`employee_id`, `name`, `phone`, `department_id`, `position_id`, `work_location`)
VALUES
(UUID_TO_BIN('10000000-0000-0000-0000-000000000001'), 'Quản trị viên hệ thống',       '0900000001', (SELECT department_id FROM department WHERE department_code = 'NS' LIMIT 1),   NULL, 'Văn phòng'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000002'), 'Nguyễn Thị Hương - Nhân sự',   '0900000002', (SELECT department_id FROM department WHERE department_code = 'NS' LIMIT 1),   (SELECT position_id FROM employee_position WHERE position_name = 'Nhân viên nhân sự' LIMIT 1), 'Phòng nhân sự'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000003'), 'Trần Văn Minh - Thủ kho vật tư','0900000003',(SELECT department_id FROM department WHERE department_code = 'KHVT' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Thủ kho' LIMIT 1), 'Kho vật tư'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000004'), 'Lê Thị Lan - Thủ kho CCDC',    '0900000004', (SELECT department_id FROM department WHERE department_code = 'KHVT' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Thủ kho' LIMIT 1), 'Kho công cụ dụng cụ'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000005'), 'Phạm Minh Đức - Quản đốc vận hành','0900000005',(SELECT department_id FROM department WHERE department_code = 'PXVH' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Quản đốc' LIMIT 1), 'Phân xưởng vận hành'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000006'), 'Hoàng Nam - Trưởng ca',        '0900000006', (SELECT department_id FROM department WHERE department_code = 'PXVH' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Trưởng Ca' LIMIT 1), 'Phân xưởng vận hành'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000007'), 'Đỗ Quang Hải - Quản đốc sửa chữa','0900000007',(SELECT department_id FROM department WHERE department_code = 'PXSC' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Quản đốc' LIMIT 1), 'Phân xưởng sửa chữa'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000008'), 'Vũ Đức Long - Tổ trưởng sửa chữa','0900000008',(SELECT department_id FROM department WHERE department_code = 'PXSC' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Tổ trưởng' LIMIT 1), 'Phân xưởng sửa chữa'),
(UUID_TO_BIN('10000000-0000-0000-0000-000000000009'), 'Nguyễn An - Người dùng',       '0900000009', (SELECT department_id FROM department WHERE department_code = 'PXVH' LIMIT 1), (SELECT position_id FROM employee_position WHERE position_name = 'Kỹ thuật viên' LIMIT 1), 'Phân xưởng vận hành')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  department_id = VALUES(department_id),
  position_id = VALUES(position_id),
  work_location = VALUES(work_location);

-- 2. Tạo 9 tài khoản đăng nhập
INSERT INTO `user`
(`user_id`, `username`, `password_hash`, `employee_id`, `is_active`)
VALUES
(UUID_TO_BIN('20000000-0000-0000-0000-000000000001'), 'admin',          @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000001'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000002'), 'hr',             @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000002'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), 'warehouse_mat',  @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000003'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000004'), 'warehouse_tool', @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000004'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), 'ops_manager',    @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000005'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), 'shift_leader',   @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000006'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000007'), 'repair_manager', @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000007'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000008'), 'team_leader',    @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000008'), 1),
(UUID_TO_BIN('20000000-0000-0000-0000-000000000009'), 'user',           @default_password, UUID_TO_BIN('10000000-0000-0000-0000-000000000009'), 1)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  employee_id = VALUES(employee_id),
  is_active = VALUES(is_active);

-- 3. Gán đúng 1 role cho mỗi employee test
INSERT INTO `employee_role` (`id`, `employee_id`, `role_id`)
SELECT UUID_TO_BIN(UUID()), seed.employee_id, r.role_id
FROM (
    SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000001') AS employee_id, 'ADMIN' AS role_code
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000002'), 'HR'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000003'), 'WAREHOUSE_MAT'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000004'), 'WAREHOUSE_TOOL'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000005'), 'OPS_MANAGER'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000006'), 'SHIFT_LEADER'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000007'), 'REPAIR_MANAGER'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000008'), 'TEAM_LEADER'
    UNION ALL SELECT UUID_TO_BIN('10000000-0000-0000-0000-000000000009'), 'USER'
) AS seed
JOIN `role` r ON r.role_code = seed.role_code
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- KIỂM TRA 9 TÀI KHOẢN + ROLE
-- UUID BINARY được hiển thị lại bằng BIN_TO_UUID(...)
-- ============================================================

SELECT
  BIN_TO_UUID(u.user_id) AS user_id,
  u.username,
  e.name AS employee_name,
  r.role_code,
  r.role_name
FROM `user` u
JOIN employee e ON e.employee_id = u.employee_id
JOIN employee_role er ON er.employee_id = e.employee_id
JOIN `role` r ON r.role_id = er.role_id
ORDER BY u.username;
