-- ============================================================
-- SCMS - SEED 20 PHIẾU YÊU CẦU CẤP VẬT TƯ
-- Bảng: consumable_request, consumable_request_item (10 phiếu)
--       spare_part_request, spare_part_request_item (10 phiếu)
--
-- CẢNH BÁO: Script này sử dụng INSERT IGNORE nên có thể chạy lại
-- nhiều lần an toàn (idempotent). Phù hợp cho môi trường dev/test.
--
-- Phụ thuộc dữ liệu có sẵn:
--   - consumable (VTTH-000001..VTTH-000100)
--   - spare_part (VTTT-000001..VTTT-000100)
--   - user (20000000-0000-0000-0000-00000000000X, 22000000-...)
--   - work_order (51000000-0000-0000-0000-00000000000X)
--
-- Dải UUID: 60xxxxxx cho consumable_request
--           61xxxxxx cho consumable_request_item
--           62xxxxxx cho spare_part_request
--           63xxxxxx cho spare_part_request_item
--
-- Thời gian: 10/07/2026 -> 05/08/2026
-- ============================================================

USE scms_db;
SET NAMES utf8mb4;

START TRANSACTION;

-- ============================================================
-- PHẦN 1: 10 PHIẾU YÊU CẦU VẬT TƯ TIÊU HAO (CONSUMABLE)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1.1 Bảng consumable_request (10 phiếu)
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `consumable_request`
  (`req_id`, `req_number`, `order_id`, `status`, `pdf_url`, `created_by`, `created_at`,
   `is_deleted`, `deleted_at`, `issued_at`, `note`, `issued_by`, `is_read`)
VALUES
-- YCVTTH-01: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000001'), 'YCVTTH-26-07-10-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000005'), 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-10 08:15:00',
 b'0', NULL, '2026-07-10 14:30:00.000000', 'Đã cấp đủ số lượng yêu cầu',
 UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), b'1'),

-- YCVTTH-02: Chờ cấp phát - có PCT - chưa đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000002'), 'YCVTTH-26-07-22-0002',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000007'), 'pending', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-22 09:20:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTH-03: Đã cấp phát - không có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000003'), 'YCVTTH-26-07-25-0001',
 NULL, 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), '2026-07-25 10:45:00',
 b'0', NULL, '2026-07-25 16:10:00.000000', 'Cấp vật tư bảo dưỡng định kỳ',
 UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), b'1'),

-- YCVTTH-04: Từ chối - có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000004'), 'YCVTTH-26-07-28-0003',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000009'), 'rejected', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-28 11:30:00',
 b'0', NULL, NULL, 'Vật tư hiện đang hết hàng, chờ nhập kho mới',
 NULL, b'1'),

-- YCVTTH-05: Chờ cấp phát - không có PCT - chưa đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000005'), 'YCVTTH-26-07-30-0001',
 NULL, 'pending', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000028'), '2026-07-30 07:50:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTH-06: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000006'), 'YCVTTH-26-08-01-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000011'), 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-08-01 08:00:00',
 b'0', NULL, '2026-08-01 15:45:00.000000', 'Cấp đầy đủ theo yêu cầu',
 UUID_TO_BIN('22000000-0000-0000-0000-000000000020'), b'1'),

-- YCVTTH-07: Chờ cấp phát - không có PCT - chưa đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000007'), 'YCVTTH-26-08-02-0001',
 NULL, 'pending', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), '2026-08-02 13:20:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTH-08: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000008'), 'YCVTTH-26-08-03-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000013'), 'issued', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000028'), '2026-08-03 09:10:00',
 b'0', NULL, '2026-08-03 14:20:00.000000', 'Đã cấp phát, thiếu 2 cuộn băng keo',
 UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), b'1'),

-- YCVTTH-09: Chờ cấp phát - có PCT - chưa đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000009'), 'YCVTTH-26-08-04-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000014'), 'pending', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-08-04 10:30:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTH-10: Từ chối - không có PCT - đã đọc
(UUID_TO_BIN('60000000-0000-0000-0000-000000000010'), 'YCVTTH-26-08-05-0001',
 NULL, 'rejected', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), '2026-08-05 08:45:00',
 b'0', NULL, NULL, 'Yêu cầu không hợp lệ, vật tư không phù hợp với mục đích sử dụng',
 NULL, b'1');

-- ────────────────────────────────────────────────────────────
-- 1.2 Bảng consumable_request_item
-- ────────────────────────────────────────────────────────────

-- Items cho YCVTTH-01 (đã cấp đủ)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000001'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000004' LIMIT 1), 20, 20),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000001'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000005' LIMIT 1), 10, 10),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000001'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000006' LIMIT 1), 15, 15);

-- Items cho YCVTTH-02 (chờ cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000002'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000019' LIMIT 1), 5, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000002'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000017' LIMIT 1), 30, 0);

-- Items cho YCVTTH-03 (đã cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000003'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000001' LIMIT 1), 50, 50),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000003'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000003' LIMIT 1), 10, 10),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000008'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000003'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000032' LIMIT 1), 20, 20);

-- Items cho YCVTTH-04 (từ chối)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000009'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000004'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000048' LIMIT 1), 10, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000010'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000004'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000049' LIMIT 1), 8, 0);

-- Items cho YCVTTH-05 (chờ cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000011'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000005'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000007' LIMIT 1), 40, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000012'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000005'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000008' LIMIT 1), 30, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000013'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000005'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000015' LIMIT 1), 25, 0);

-- Items cho YCVTTH-06 (đã cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000014'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000006'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000021' LIMIT 1), 15, 15),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000015'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000006'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000022' LIMIT 1), 10, 10);

-- Items cho YCVTTH-07 (chờ cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000016'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000007'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000026' LIMIT 1), 8, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000017'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000007'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000025' LIMIT 1), 12, 0);

-- Items cho YCVTTH-08 (đã cấp, thiếu 1 item)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000018'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000008'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000007' LIMIT 1), 50, 48),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000019'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000008'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000023' LIMIT 1), 20, 20),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000020'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000008'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000055' LIMIT 1), 15, 15);

-- Items cho YCVTTH-09 (chờ cấp)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000021'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000009'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000053' LIMIT 1), 60, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000022'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000009'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000041' LIMIT 1), 10, 0);

-- Items cho YCVTTH-10 (từ chối)
INSERT IGNORE INTO `consumable_request_item`
  (`item_id`, `req_id`, `consumable_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('61000000-0000-0000-0000-000000000023'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000010'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000037' LIMIT 1), 5, 0),
(UUID_TO_BIN('61000000-0000-0000-0000-000000000024'),
 UUID_TO_BIN('60000000-0000-0000-0000-000000000010'),
 (SELECT consumable_id FROM consumable WHERE code='VTTH-000034' LIMIT 1), 3, 0);

-- ============================================================
-- PHẦN 2: 10 PHIẾU YÊU CẦU VẬT TƯ THAY THẾ (SPARE PART)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 2.1 Bảng spare_part_request (10 phiếu)
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `spare_part_request`
  (`req_id`, `req_number`, `order_id`, `status`, `pdf_url`, `created_by`, `created_at`,
   `is_deleted`, `deleted_at`, `issued_at`, `note`, `issued_by`, `is_read`)
VALUES
-- YCVTTT-01: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000001'), 'YCVTTT-26-07-11-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000005'), 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-11 08:30:00',
 b'0', NULL, '2026-07-11 13:50:00.000000', 'Cấp đủ vòng bi và phớt thay thế cho hộp giảm tốc',
 UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), b'1'),

-- YCVTTT-02: Chờ cấp phát - có PCT - chưa đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000002'), 'YCVTTT-26-07-21-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000007'), 'pending', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000043'), '2026-07-21 14:15:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTT-03: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000003'), 'YCVTTT-26-07-24-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000008'), 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-24 07:40:00',
 b'0', NULL, '2026-07-24 11:25:00.000000', 'Thay thế van và gioăng đường ống',
 UUID_TO_BIN('22000000-0000-0000-0000-000000000020'), b'1'),

-- YCVTTT-04: Chờ cấp phát - không có PCT - chưa đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000004'), 'YCVTTT-26-07-27-0001',
 NULL, 'pending', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), '2026-07-27 09:00:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTT-05: Từ chối - có PCT - đã đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000005'), 'YCVTTT-26-07-29-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000010'), 'rejected', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000044'), '2026-07-29 15:30:00',
 b'0', NULL, NULL, 'Tồn kho không đủ, đã đặt hàng nhà cung cấp dự kiến về ngày 15/08',
 NULL, b'1'),

-- YCVTTT-06: Đã cấp phát - có PCT - đã đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000006'), 'YCVTTT-26-07-31-0001',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000012'), 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-07-31 08:20:00',
 b'0', NULL, '2026-07-31 14:00:00.000000', 'Cấp thiết bị điện thay thế cho tủ điều khiển',
 UUID_TO_BIN('20000000-0000-0000-0000-000000000003'), b'1'),

-- YCVTTT-07: Chờ cấp phát - có PCT - chưa đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000007'), 'YCVTTT-26-08-01-0002',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000011'), 'pending', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000043'), '2026-08-01 10:10:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTT-08: Đã cấp phát - không có PCT - đã đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000008'), 'YCVTTT-26-08-03-0002',
 NULL, 'issued', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000005'), '2026-08-03 13:45:00',
 b'0', NULL, '2026-08-03 16:30:00.000000', 'Cấp vật tư dự phòng cho kho phân xưởng',
 UUID_TO_BIN('22000000-0000-0000-0000-000000000020'), b'1'),

-- YCVTTT-09: Chờ cấp phát - có PCT - chưa đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000009'), 'YCVTTT-26-08-04-0002',
 UUID_TO_BIN('51000000-0000-0000-0000-000000000014'), 'pending', NULL,
 UUID_TO_BIN('20000000-0000-0000-0000-000000000006'), '2026-08-04 11:20:00',
 b'0', NULL, NULL, NULL, NULL, b'0'),

-- YCVTTT-10: Chờ cấp phát - không có PCT - chưa đọc
(UUID_TO_BIN('62000000-0000-0000-0000-000000000010'), 'YCVTTT-26-08-05-0002',
 NULL, 'pending', NULL,
 UUID_TO_BIN('22000000-0000-0000-0000-000000000028'), '2026-08-05 09:30:00',
 b'0', NULL, NULL, NULL, NULL, b'0');

-- ────────────────────────────────────────────────────────────
-- 2.2 Bảng spare_part_request_item
-- ────────────────────────────────────────────────────────────

-- Items cho YCVTTT-01 (đã cấp đủ)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000001'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000001' LIMIT 1), 4, 4),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000001'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000014' LIMIT 1), 6, 6),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000001'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000015' LIMIT 1), 4, 4);

-- Items cho YCVTTT-02 (chờ cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000002'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000011' LIMIT 1), 2, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000002'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000050' LIMIT 1), 1, 0);

-- Items cho YCVTTT-03 (đã cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000003'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000032' LIMIT 1), 3, 3),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000003'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000016' LIMIT 1), 10, 10),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000008'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000003'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000017' LIMIT 1), 8, 8);

-- Items cho YCVTTT-04 (chờ cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000009'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000004'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000023' LIMIT 1), 6, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000010'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000004'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000024' LIMIT 1), 6, 0);

-- Items cho YCVTTT-05 (từ chối)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000011'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000005'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000048' LIMIT 1), 2, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000012'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000005'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000049' LIMIT 1), 1, 0);

-- Items cho YCVTTT-06 (đã cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000013'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000006'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000061' LIMIT 1), 5, 5),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000014'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000006'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000064' LIMIT 1), 4, 4),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000015'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000006'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000066' LIMIT 1), 10, 10);

-- Items cho YCVTTT-07 (chờ cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000016'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000007'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000041' LIMIT 1), 4, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000017'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000007'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000043' LIMIT 1), 3, 0);

-- Items cho YCVTTT-08 (đã cấp, thiếu 1 item)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000018'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000008'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000056' LIMIT 1), 20, 20),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000019'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000008'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000058' LIMIT 1), 10, 8),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000020'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000008'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000066' LIMIT 1), 12, 12);

-- Items cho YCVTTT-09 (chờ cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000021'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000009'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000002' LIMIT 1), 4, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000022'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000009'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000008' LIMIT 1), 2, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000023'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000009'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000027' LIMIT 1), 2, 0);

-- Items cho YCVTTT-10 (chờ cấp)
INSERT IGNORE INTO `spare_part_request_item`
  (`item_id`, `req_id`, `spare_part_id`, `quantity_requested`, `quantity_issued`)
VALUES
(UUID_TO_BIN('63000000-0000-0000-0000-000000000024'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000010'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000020' LIMIT 1), 20, 0),
(UUID_TO_BIN('63000000-0000-0000-0000-000000000025'),
 UUID_TO_BIN('62000000-0000-0000-0000-000000000010'),
 (SELECT spare_part_id FROM spare_part WHERE code='VTTT-000021' LIMIT 1), 20, 0);

COMMIT;

-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================

-- Tổng số phiếu theo loại và trạng thái
SELECT 'Vật tư tiêu hao' AS loai_phieu, status AS trang_thai, COUNT(*) AS so_phieu
FROM consumable_request
WHERE BIN_TO_UUID(req_id) LIKE '60000000-%'
GROUP BY status
UNION ALL
SELECT 'Vật tư thay thế', status, COUNT(*)
FROM spare_part_request
WHERE BIN_TO_UUID(req_id) LIKE '62000000-%'
GROUP BY status;

-- Chi tiết từng phiếu vật tư tiêu hao
SELECT cr.req_number    AS so_phieu,
       wo.order_number  AS so_pct,
       cr.status        AS trang_thai,
       e.name           AS nguoi_yeu_cau,
       COUNT(cri.item_id) AS so_dong_vat_tu,
       SUM(cri.quantity_requested) AS tong_sl_yeu_cau,
       SUM(cri.quantity_issued)    AS tong_sl_da_cap
FROM consumable_request cr
LEFT JOIN consumable_request_item cri ON cri.req_id = cr.req_id
LEFT JOIN work_order wo ON wo.order_id = cr.order_id
LEFT JOIN `user` u      ON u.user_id = cr.created_by
LEFT JOIN employee e    ON e.employee_id = u.employee_id
WHERE BIN_TO_UUID(cr.req_id) LIKE '60000000-%'
GROUP BY cr.req_id, cr.req_number, wo.order_number, cr.status, e.name
ORDER BY cr.req_number;

-- Chi tiết từng phiếu vật tư thay thế
SELECT sr.req_number    AS so_phieu,
       wo.order_number  AS so_pct,
       sr.status        AS trang_thai,
       e.name           AS nguoi_yeu_cau,
       COUNT(sri.item_id) AS so_dong_vat_tu,
       SUM(sri.quantity_requested) AS tong_sl_yeu_cau,
       SUM(sri.quantity_issued)    AS tong_sl_da_cap
FROM spare_part_request sr
LEFT JOIN spare_part_request_item sri ON sri.req_id = sr.req_id
LEFT JOIN work_order wo ON wo.order_id = sr.order_id
LEFT JOIN `user` u      ON u.user_id = sr.created_by
LEFT JOIN employee e    ON e.employee_id = u.employee_id
WHERE BIN_TO_UUID(sr.req_id) LIKE '62000000-%'
GROUP BY sr.req_id, sr.req_number, wo.order_number, sr.status, e.name
ORDER BY sr.req_number;
