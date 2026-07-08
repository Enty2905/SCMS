-- ============================================================
-- SCMS – SEED DATA CHO 3 CHỨC NĂNG TEST
-- Chỉ insert vào các bảng CHƯA CÓ DỮ LIỆU trong seed gốc
-- ============================================================
-- Bảng seed gốc đã có (KHÔNG CẦN CHẠY LẠI):
--   role, department, employee_position,
--   employee, user, employee_role,
--   technical_param, unit
--
-- Bảng cần seed thêm (LIÊN QUAN 3 CHỨC NĂNG):
--   equipment          ← chức năng 1, 2, 3
--   repair_request     ← chức năng 1, 2
--   work_order         ← chức năng 2
--   work_order_member  ← chức năng 2
--   technical_assessment ← chức năng 3
--
-- UUID NHÂN VIÊN TỪ SEED GỐC (tham chiếu):
--   employee_id 10000000-...-0001  Quản trị viên         / user admin
--   employee_id 10000000-...-0003  Trần Văn Minh (thủ kho vật tư)
--   employee_id 10000000-...-0005  Phạm Minh Đức (quản đốc vận hành)
--   employee_id 10000000-...-0006  Hoàng Nam (trưởng ca)
--   employee_id 10000000-...-0007  Đỗ Quang Hải (quản đốc sửa chữa)
--   employee_id 10000000-...-0008  Vũ Đức Long (tổ trưởng sửa chữa)
--   employee_id 10000000-...-0009  Nguyễn An (kỹ thuật viên)
--
-- UUID USER TỪ SEED GỐC (tham chiếu):
--   user_id 20000000-...-0006  shift_leader   (tạo repair_request)
--   user_id 20000000-...-0007  repair_manager (tạo work_order)
--   user_id 20000000-...-0008  team_leader    (tạo assessment)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE scms_db;

-- ============================================================
-- 0. EQUIPMENT_SYSTEM – 6 hệ thống thiết bị
-- ============================================================

INSERT INTO `equipment_system`
  (`system_id`, `system_name`, `system_code`, `description`, `parent_system_id`)
VALUES
(UUID_TO_BIN('31000000-0000-0000-0000-000000000001'),
 'He thong Lo hoi chinh', 'SYS-BOILER', 'He thong lo hoi sinh hoi qua nhiet cho tuabin', NULL),

(UUID_TO_BIN('31000000-0000-0000-0000-000000000004'),
 'He thong Tuabin hoi', 'SYS-TURBINE', 'He thong tuabin biến đổi nhiệt năng hơi thành cơ năng', NULL),

(UUID_TO_BIN('31000000-0000-0000-0000-000000000005'),
 'He thong May phat dien', 'SYS-GENERATOR', 'He thong may phat dien va kích từ', NULL),

(UUID_TO_BIN('31000000-0000-0000-0000-000000000006'),
 'He thong Xu ly nuoc', 'SYS-WATER', 'He thong xu ly nuoc cap va nuoc thai nha may', NULL),

(UUID_TO_BIN('31000000-0000-0000-0000-000000000002'),
 'Duong ong hoi chinh', 'SYS-STEAM-PIPE', 'Duong ong dan hoi ap luc cao tu bao hoi lo sang tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('31000000-0000-0000-0000-000000000003'),
 'Quat gio lo hoi', 'SYS-BOILER-FAN', 'He thong quat gio cap khi va hut khoi lo hoi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001'))

ON DUPLICATE KEY UPDATE
  system_name = VALUES(system_name),
  system_code = VALUES(system_code),
  description = VALUES(description);

-- ============================================================
-- 1. EQUIPMENT – 30 thiết bị (5 thiết bị gốc + 25 thiết bị mới để test phân trang)
--    Cột: equipment_id, kks_code, name, type, status, location, system_id
-- ============================================================

INSERT INTO `equipment`
  (`equipment_id`, `kks_code`, `name`, `type`, `status`, `location`, `system_id`)
VALUES
-- 5 thiết bị gốc
(UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),
 '10LAB10AP001', 'Bom nuoc cap so 1', 'Co khi', 'active', 'PXVH - Tang 1, khu bom nuoc', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),
 '10MAB20CP001', 'May nen khi so 1', 'Co khi', 'broken', 'PXVH - Tang 2, khu nen khi', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000003'),
 '10EAB10ET001', 'Dong co dien bom so 1', 'Dien', 'maintenance', 'PXVH - Tang 1, khu bom nuoc', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000004'),
 '10EAB20ET002', 'Bien tan ABB so 2', 'Dien', 'active', 'PXVH - Tu dien tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000005'),
 '10LCA10CP001', 'Bo dieu khien PLC so 1', 'CI', 'active', 'PXVH - Phong dieu khien trung tam', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

-- Các thiết bị mới để test phân trang
(UUID_TO_BIN('30000000-0000-0000-0000-000000000006'),
 '10LAB10AP002', 'Bom nuoc cap so 2', 'Co khi', 'active', 'PXVH - Tang 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000007'),
 '10LAB20AP001', 'Bom tuan hoan lo hoi A', 'Co khi', 'maintenance', 'PXVH - Tang 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000008'),
 '10LAB20AP002', 'Bom tuan hoan lo hoi B', 'Co khi', 'active', 'PXVH - Tang 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000009'),
 '10LBA10AA001', 'Van chan duong hoi chinh A', 'Co khi', 'active', 'PXVH - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000010'),
 '10LBA10AA002', 'Van chan duong hoi chinh B', 'Co khi', 'active', 'PXVH - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000011'),
 '10LBA20AA001', 'Van dieu chinh ap suat hoi', 'Co khi', 'broken', 'PXVH - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000012'),
 '10FAD10AN001', 'Quat gio cuong buc A (FD Fan)', 'Co khi', 'active', 'Khu vuc lo hoi - Ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000013'),
 '10FAD10AN002', 'Quat gio cuong buc B (FD Fan)', 'Co khi', 'active', 'Khu vuc lo hoi - Ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000014'),
 '10FAD10ET001', 'Dong co quat gio FD Fan A', 'Dien', 'active', 'Khu vuc lo hoi - Ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000015'),
 '10FAD10ET002', 'Dong co quat gio FD Fan B', 'Dien', 'maintenance', 'Khu vuc lo hoi - Ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000016'),
 '10MAX10AT001', 'Tuabin hoi cao ap', 'Co khi', 'active', 'Gian may chinh - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000017'),
 '10MAX20AT001', 'Tuabin hoi trung ap', 'Co khi', 'active', 'Gian may chinh - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000018'),
 '10MAX30AT001', 'Tuabin hoi ha ap', 'Co khi', 'active', 'Gian may chinh - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000019'),
 '10MGT10AG001', 'May phat dien chinh', 'Dien', 'active', 'Gian may chinh - Tang 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000020'),
 '10MGT10ET001', 'He thong kich tu may phat', 'Dien', 'active', 'Phong thiet bi dien', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000021'),
 '10MGT10CP001', 'Tu may cat dau cuc may phat', 'Dien', 'active', 'Phong thiet bi dien', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000022'),
 '10GCA10AP001', 'Bom nuoc ngung A', 'Co khi', 'active', 'Duoi san tuabin - Tang 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000023'),
 '10GCA10AP002', 'Bom nuoc ngung B', 'Co khi', 'broken', 'Duoi san tuabin - Tang 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000024'),
 '10CTY10CT001', 'Thap giai nhiet A', 'Co khi', 'active', 'Khu vuc ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000025'),
 '10HAD10AP001', 'Bom nuoc tho dau vao', 'Co khi', 'active', 'Tram bom nuoc tho', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000026'),
 '10HAD20AP001', 'Bom dinh luong hoa chat', 'Co khi', 'active', 'Nha xu ly hoa chat', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000027'),
 '10HAD30AT001', 'Be loc cat ap luc', 'Co khi', 'maintenance', 'Nha xu ly nuoc', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000028'),
 '10LCA20CP001', 'Tu dieu khien DCS tuabin', 'CI', 'active', 'Phong dieu khien trung tam', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000029'),
 '10LCA30CP001', 'Tu giam sat rung dong vong bi', 'CI', 'active', 'Phong dieu khien trung tam', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

(UUID_TO_BIN('30000000-0000-0000-0000-000000000030'),
 '10EYB10ET001', 'May bien ap tu dung', 'Dien', 'active', 'Tram bien ap ngoai troi', UUID_TO_BIN('31000000-0000-0000-0000-000000000005'))

ON DUPLICATE KEY UPDATE
  name     = VALUES(name),
  type     = VALUES(type),
  status   = VALUES(status),
  location = VALUES(location),
  system_id = VALUES(system_id);

-- Kiểm tra
SELECT BIN_TO_UUID(equipment_id) AS equipment_id, kks_code, name, type, status
FROM equipment ORDER BY kks_code;

-- ============================================================
-- 2. REPAIR REQUEST – 7 yêu cầu sửa chữa
--    Cột: request_id, equipment_id, created_by, description, priority, status, created_at
--    created_by → user.user_id (FK user)
--    priority: 'low' | 'medium' | 'high' | 'critical'
--    status: 'pending' | 'confirmed' | 'in_progress' | 'done' | 'cancelled'
-- ============================================================

INSERT INTO `repair_request`
  (`request_id`, `equipment_id`, `created_by`,
   `description`, `priority`, `status`, `created_at`)
VALUES

-- ── PENDING (3): dùng để test GET /maintenance/requests/pending ──────────
(UUID_TO_BIN('40000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Bom nuoc cap so 1 phat tieng keu la, rung dong manh. Nhiet do o bi ~75 do C (nguong 65 do C). Nghi vong bi bi mon.',
 'high', 'pending',
 DATE_SUB(NOW(), INTERVAL 3 DAY)),

(UUID_TO_BIN('40000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'May nen khi so 1 khong khoi dong. Ap suat dau ra = 0 bar, nghi hong van xa. Toan bo day chuyen bi anh huong.',
 'critical', 'pending',
 DATE_SUB(NOW(), INTERVAL 2 DAY)),

(UUID_TO_BIN('40000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Dong co dien bom so 1 bi nong qua muc: 130 do C, vuot nguong 120 do C. Da ngat may de tranh chay cuon day.',
 'medium', 'pending',
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- ── CONFIRMED (1): đã xác nhận, chưa tạo PCT ───────────────────────────
(UUID_TO_BIN('40000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Bien tan ABB so 2 hien loi F0001 (qua ap dau vao). Reset nhieu lan nhung loi lai xuat hien sau vai phut.',
 'high', 'confirmed',
 DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- ── IN_PROGRESS (1): đang có PCT thực hiện ─────────────────────────────
(UUID_TO_BIN('40000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'PLC so 1 mat ket noi voi module I/O so 3. SCADA bao loi "Module offline". Can kiem tra cap truyen thong.',
 'high', 'in_progress',
 DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- ── DONE (1): đã hoàn thành ─────────────────────────────────────────────
(UUID_TO_BIN('40000000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'Bom nuoc cap so 1 ro ri nhe tai mat bich dau day. Luong ro ri nho, khong anh huong luu luong.',
 'low', 'done',
 DATE_SUB(NOW(), INTERVAL 14 DAY)),

-- ── CANCELLED (1): đã huỷ ───────────────────────────────────────────────
(UUID_TO_BIN('40000000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'),
 'May nen khi phat tieng keu khi khoi dong. Sau khi kiem tra, day la am thanh binh thuong cua van an toan xa ap.',
 'low', 'cancelled',
 DATE_SUB(NOW(), INTERVAL 10 DAY))

ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  priority    = VALUES(priority),
  status      = VALUES(status);

-- Kiểm tra
SELECT
  BIN_TO_UUID(rr.request_id) AS request_id,
  eq.kks_code,
  LEFT(eq.name, 22)          AS equipment,
  rr.priority,
  rr.status,
  u.username                 AS created_by,
  DATE(rr.created_at)        AS created_date
FROM repair_request rr
JOIN equipment eq ON eq.equipment_id = rr.equipment_id
JOIN `user`    u  ON u.user_id       = rr.created_by
ORDER BY rr.created_at DESC;

-- ============================================================
-- 3. WORK ORDER – 2 phiếu công tác (PCT)
--    Cột (từ CREATE TABLE gốc):
--      order_id, order_number, request_id, content, status,
--      start_date, end_date, extended_to,
--      work_leader_id, direct_commander_id, safety_supervisor_id,
--      created_by, created_at
--
--    work_leader_id       → employee 10000000-...-0008 (tổ trưởng)
--    direct_commander_id  → employee 10000000-...-0007 (quản đốc SC)
--    safety_supervisor_id → employee 10000000-...-0005 (quản đốc VH)
--    created_by           → user     20000000-...-0007 (repair_manager)
-- ============================================================

INSERT INTO `work_order`
  (`order_id`, `order_number`, `request_id`, `content`, `status`,
   `start_date`, `end_date`, `extended_to`,
   `work_leader_id`, `direct_commander_id`, `safety_supervisor_id`,
   `created_by`, `created_at`)
VALUES

-- PCT 1: status = open, đang thực hiện (gắn với request #5 – PLC)
(UUID_TO_BIN('50000000-0000-0000-0000-000000000001'),
 'PCT-2025-001',
 UUID_TO_BIN('40000000-0000-0000-0000-000000000005'),
 'Kiem tra va khac phuc loi mat ket noi module I/O so 3 tren PLC so 1. Cong viec: (1) Kiem tra cap Profibus, (2) Do dien tro cach dien, (3) Thay module I/O neu hong, (4) Test ket noi SCADA.',
 'open',
 DATE_SUB(NOW(), INTERVAL 6 DAY),  -- start_date
 DATE_SUB(NOW(), INTERVAL 3 DAY),  -- end_date goc
 DATE_ADD(NOW(), INTERVAL 1 DAY),  -- extended_to (da gia han)
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),  -- work_leader: to truong
 UUID_TO_BIN('10000000-0000-0000-0000-000000000007'),  -- direct_commander: quan doc SC
 UUID_TO_BIN('10000000-0000-0000-0000-000000000005'),  -- safety_supervisor: quan doc VH
 UUID_TO_BIN('20000000-0000-0000-0000-000000000007'),  -- created_by: repair_manager
 DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- PCT 2: status = draft, mới tạo (gắn với request #4 – biến tần)
(UUID_TO_BIN('50000000-0000-0000-0000-000000000002'),
 'PCT-2025-002',
 UUID_TO_BIN('40000000-0000-0000-0000-000000000004'),
 'Kiem tra bien tan ABB so 2, xu ly loi F0001. Cong viec: (1) Do dien ap nguon 3 pha, (2) Kiem tra line reactor, (3) Cap nhat firmware, (4) Chay thu 2 gio.',
 'draft',
 DATE_ADD(NOW(), INTERVAL 1 DAY),  -- chua bat dau
 DATE_ADD(NOW(), INTERVAL 2 DAY),
 NULL,
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('20000000-0000-0000-0000-000000000007'),
 DATE_SUB(NOW(), INTERVAL 1 DAY))

ON DUPLICATE KEY UPDATE
  content    = VALUES(content),
  status     = VALUES(status),
  start_date = VALUES(start_date),
  end_date   = VALUES(end_date),
  extended_to= VALUES(extended_to);

-- Kiểm tra
SELECT
  BIN_TO_UUID(wo.order_id)  AS order_id,
  wo.order_number,
  wo.status,
  DATE(wo.start_date)       AS start_date,
  DATE(wo.end_date)         AS end_date,
  DATE(wo.extended_to)      AS extended_to,
  BIN_TO_UUID(wo.request_id) AS linked_request_id,
  el.name                   AS work_leader,
  ec.name                   AS direct_commander,
  es.name                   AS safety_supervisor,
  uc.username               AS created_by_user
FROM work_order wo
LEFT JOIN employee el  ON el.employee_id = wo.work_leader_id
LEFT JOIN employee ec  ON ec.employee_id = wo.direct_commander_id
LEFT JOIN employee es  ON es.employee_id = wo.safety_supervisor_id
LEFT JOIN `user`   uc  ON uc.user_id     = wo.created_by
ORDER BY wo.created_at;

-- ============================================================
-- 4. WORK ORDER MEMBER – thành viên thi công
--    Cột: id, order_id, employee_id, check_in_at, check_out_at, added_at
--    Ghi chú: check_in_at / check_out_at có thể NULL
-- ============================================================

INSERT INTO `work_order_member`
  (`id`, `order_id`, `employee_id`,
   `check_in_at`, `check_out_at`, `added_at`)
VALUES

-- PCT 1 (PCT-2025-001): 3 thành viên
-- Thành viên 1: Kỹ thuật viên (emp 0009) – đã check-in & check-out
(UUID_TO_BIN('60000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('50000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000009'),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 7 HOUR),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 17 HOUR),
 DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- Thành viên 2: Tổ trưởng (emp 0008) – đang làm, chưa check-out
(UUID_TO_BIN('60000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('50000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 7 HOUR),
 NULL,
 DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- Thành viên 3: Thủ kho vật tư (emp 0003) – hỗ trợ 1 ngày
(UUID_TO_BIN('60000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('50000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000003'),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 8 HOUR),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 10 HOUR),
 DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- PCT 2 (PCT-2025-002): 1 thành viên, chưa bắt đầu
-- Thành viên 1: Kỹ thuật viên (emp 0009) – chưa check-in
(UUID_TO_BIN('60000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('50000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('10000000-0000-0000-0000-000000000009'),
 NULL,
 NULL,
 DATE_SUB(NOW(), INTERVAL 1 DAY))

ON DUPLICATE KEY UPDATE
  check_in_at  = VALUES(check_in_at),
  check_out_at = VALUES(check_out_at);

-- Kiểm tra
SELECT
  BIN_TO_UUID(m.id)       AS member_row_id,
  wo.order_number,
  e.name                  AS employee_name,
  ep.position_name,
  m.check_in_at,
  m.check_out_at,
  DATE(m.added_at)        AS added_date
FROM work_order_member m
JOIN work_order         wo ON wo.order_id    = m.order_id
JOIN employee            e ON e.employee_id  = m.employee_id
LEFT JOIN employee_position ep ON ep.position_id = e.position_id
ORDER BY wo.order_number, m.added_at;

-- ============================================================
-- 5. TECHNICAL ASSESSMENT – 2 biên bản đánh giá kỹ thuật
--    Cột: assessment_id, equipment_id,
--         damage_description, proposed_action,
--         repair_signed_by, repair_signed_at,
--         operation_signed_by, operation_signed_at,
--         pdf_url, created_by, created_at
--
--    created_by       → employee.employee_id  (KHÔNG phải user)
--    repair_signed_by → employee.employee_id
--    operation_signed_by → employee.employee_id
--
--    Biên bản 1: DRAFT  – chưa ký, pdf_url = NULL
--    Biên bản 2: SIGNED – đã ký 2 bên, pdf_url có giá trị
-- ============================================================

INSERT INTO `technical_assessment`
  (`assessment_id`, `equipment_id`,
   `damage_description`, `proposed_action`,
   `repair_signed_by`,    `repair_signed_at`,
   `operation_signed_by`, `operation_signed_at`,
   `pdf_url`,
   `created_by`, `created_at`)
VALUES

-- Biên bản 1: DRAFT – Máy nén khí (broken) – Tổ trưởng lập
(UUID_TO_BIN('70000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000002'),  -- may nen khi
 'May nen khi so 1 (KKS: 10MAB20CP001): Van xa ap bi ket vi tri dong. Vong phet truc bi mon, ro ri khi ~5-8 l/ph. Bo loc khi dau hut bi tac (dP=0.8 bar, gioi han 0.5 bar). Ap suat lam viec: 0 bar (thiet ke: 8 bar).',
 'Phuong an: (1) Thao va thay van xa ap (unloader valve), (2) Thay vong phet truc, (3) Thay loc khi (ma: FL-MAB20-001), (4) Ve sinh, kiem tra dau boi tron, (5) Chay thu khong tai 30 phut kiem tra ro ri.',
 -- Chua co chu ky
 NULL, NULL,
 NULL, NULL,
 -- Chua upload PDF
 NULL,
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),  -- created_by: to truong (employee)
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Biên bản 2: SIGNED – Bơm nước (đã hoàn thành) – Tổ trưởng lập
(UUID_TO_BIN('70000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('30000000-0000-0000-0000-000000000001'),  -- bom nuoc cap
 'Bom nuoc cap so 1 (KKS: 10LAB10AP001): Gasket mat bich DN150 bi hong, ro ri ~2 l/phut. Bu long mat bich bi gi set, mo-men xiet khong du. Be mat mat bich con tot.',
 'Da thuc hien: (1) Cat nguon, xa ap, (2) Thay gasket moi (spiral wound DN150 SS316), (3) Thay 8 bu long ma kem, (4) Xiet luc 85 N.m, (5) Chay thu 10 bar trong 30 phut – khong ro ri.',
 -- Ben sua chua ky: to truong (emp 0008)
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 13 DAY), INTERVAL 10 HOUR),
 -- Ben van hanh ky: quan doc VH (emp 0005)
 UUID_TO_BIN('10000000-0000-0000-0000-000000000005'),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 13 DAY), INTERVAL 11 HOUR),
 -- Da upload PDF (duong dan gia lap)
 'uploads/pdf/assessment_70000000_signed_1719840000000.pdf',
 UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),  -- created_by: to truong (employee)
 DATE_SUB(NOW(), INTERVAL 13 DAY))

ON DUPLICATE KEY UPDATE
  damage_description  = VALUES(damage_description),
  proposed_action     = VALUES(proposed_action),
  repair_signed_by    = VALUES(repair_signed_by),
  repair_signed_at    = VALUES(repair_signed_at),
  operation_signed_by = VALUES(operation_signed_by),
  operation_signed_at = VALUES(operation_signed_at),
  pdf_url             = VALUES(pdf_url);

-- Kiểm tra
SELECT
  BIN_TO_UUID(ta.assessment_id)    AS assessment_id,
  eq.kks_code,
  LEFT(eq.name, 22)                AS equipment,
  LEFT(ta.damage_description, 50)  AS damage_preview,
  er.name                          AS repair_signed_by,
  ta.repair_signed_at,
  eo.name                          AS operation_signed_by,
  ta.operation_signed_at,
  IF(ta.pdf_url IS NOT NULL, 'SIGNED', 'DRAFT') AS status,
  ec.name                          AS created_by,
  DATE(ta.created_at)              AS created_date
FROM technical_assessment ta
JOIN equipment eq    ON eq.equipment_id = ta.equipment_id
JOIN employee  ec    ON ec.employee_id  = ta.created_by
LEFT JOIN employee er ON er.employee_id = ta.repair_signed_by
LEFT JOIN employee eo ON eo.employee_id = ta.operation_signed_by
ORDER BY ta.created_at DESC;

-- ============================================================
-- TỔNG HỢP – HƯỚNG DẪN TEST API
-- ============================================================

SELECT '=== CHUC NANG 1: GET pending requests ===' AS huong_dan, '' AS detail
UNION ALL
SELECT
  CONCAT('  --> ', COUNT(*), ' request co status=pending, dung GET /maintenance/requests/pending'),
  ''
FROM repair_request WHERE status = 'pending'

UNION ALL
SELECT '=== CHUC NANG 2: POST work order ===' AS huong_dan, '' AS detail
UNION ALL
SELECT
  '  --> Dung 1 trong 3 requestId pending sau:',
  CONCAT(BIN_TO_UUID(request_id), ' (', priority, ')')
FROM repair_request WHERE status = 'pending'
UNION ALL
SELECT
  '  --> employeeId cho work_leader / direct_commander / safety_supervisor:',
  CONCAT(BIN_TO_UUID(employee_id), ' – ', name)
FROM employee WHERE employee_id IN (
  UUID_TO_BIN('10000000-0000-0000-0000-000000000005'),
  UUID_TO_BIN('10000000-0000-0000-0000-000000000007'),
  UUID_TO_BIN('10000000-0000-0000-0000-000000000008'),
  UUID_TO_BIN('10000000-0000-0000-0000-000000000009')
)

UNION ALL
SELECT '=== CHUC NANG 3: POST assessment + export PDF ===' AS huong_dan, '' AS detail
UNION ALL
SELECT
  '  --> Dung 1 trong 5 equipmentId sau:',
  CONCAT(BIN_TO_UUID(equipment_id), ' – ', name, ' [', status, ']')
FROM equipment
UNION ALL
SELECT
  '  --> Assessment co san de test export-pdf:',
  CONCAT(BIN_TO_UUID(assessment_id), ' (', IF(pdf_url IS NULL, 'DRAFT', 'SIGNED'), ')')
FROM technical_assessment;

SET FOREIGN_KEY_CHECKS = 1;
