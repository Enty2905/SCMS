-- ============================================================
-- SEED DATA TEST – Equipment & Repair Request mẫu
-- Chạy sau khi đã chạy schema chính (scms_db đã có đủ bảng và seed auth)
-- ============================================================

USE scms_db;

-- ============================================================
-- EQUIPMENT MẪU (3 thiết bị)
-- ============================================================

INSERT INTO `equipment` (`equipment_id`, `kks_code`, `name`, `type`, `status`, `location`, `system_id`)
VALUES
(UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),
 '10LAB10AP001', 'Bơm nước cấp số 1', 'Cơ khí', 'active',   'Phân xưởng vận hành - Tầng 1', NULL),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),
 '10MAB20CP001', 'Máy nén khí số 1',  'Cơ khí', 'broken',   'Phân xưởng vận hành - Tầng 2', NULL),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000003'),
 '10EAB10ET001', 'Động cơ điện bơm 1','Điện',   'maintenance','Phân xưởng vận hành - Tầng 1', NULL)

ON DUPLICATE KEY UPDATE
  name     = VALUES(name),
  status   = VALUES(status),
  location = VALUES(location);

-- ============================================================
-- REPAIR REQUEST MẪU (3 yêu cầu, đều status = pending)
-- Người tạo: shift_leader (user_id = 20000000-0000-0000-0000-000000000006)
-- ============================================================

INSERT INTO `repair_request` (`request_id`, `equipment_id`, `created_by`, `description`, `priority`, `status`, `created_at`)
VALUES
(UUID_TO_BIN('40000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Bơm nước cấp số 1 phát tiếng kêu lạ, rung động mạnh hơn bình thường. Nghi ngờ vòng bi bị mòn.',
 'high', 'pending', NOW() - INTERVAL 2 DAY),

(UUID_TO_BIN('40000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Máy nén khí số 1 không khởi động được. Kiểm tra thấy áp suất đầu ra bằng 0, nghi hỏng van xả.',
 'critical', 'pending', NOW() - INTERVAL 1 DAY),

(UUID_TO_BIN('40000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Động cơ điện bơm số 1 bị nóng quá mức cho phép, nhiệt độ cuộn dây vượt 120°C.',
 'medium', 'pending', NOW())

ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  priority    = VALUES(priority),
  status      = VALUES(status);

-- ============================================================
-- KIỂM TRA
-- ============================================================

SELECT
  BIN_TO_UUID(rr.request_id)    AS request_id,
  eq.name                        AS equipment_name,
  eq.kks_code,
  rr.priority,
  rr.status,
  LEFT(rr.description, 60)       AS description_preview,
  u.username                     AS created_by,
  rr.created_at
FROM repair_request rr
JOIN equipment eq  ON eq.equipment_id = rr.equipment_id
JOIN `user` u      ON u.user_id = rr.created_by
ORDER BY rr.created_at DESC;
