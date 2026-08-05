-- =====================================================================
-- BUOC 1: XOA 4 HE THONG THIET BI (khu vuc lo hoi) VA TOAN BO LIEN QUAN
--
-- Pham vi:
--   HT-LH  (32...0001) He thong lo hoi
--   HT-BNC (32...0002) He thong bom nuoc cap  <- he thong CON cua HT-LH
--   HT-KN  (32...0003) He thong khi nen
--   HT-DK  (32...0004) He thong dieu khien
--
-- 5 thiet bi: 10LAB10AP001, 10QFB10AN001, 10LAB10AE001,
--             10LAC20GF002, 10CJA10CP001
--
-- LUU Y: FK equipment -> repair_request / repair_history la NO ACTION
--        nen phai xoa thu cong dung thu tu tu la len goc.
--        Backup: docs/backup_full_before_cleanup.sql
-- =====================================================================

START TRANSACTION;

-- Tap thiet bi muc tieu
CREATE TEMPORARY TABLE tmp_eq (id BINARY(16) PRIMARY KEY);
INSERT INTO tmp_eq VALUES
  (0x30000000000000000000000000000001), (0x30000000000000000000000000000002),
  (0x30000000000000000000000000000003), (0x30000000000000000000000000000004),
  (0x30000000000000000000000000000005);

-- Tap yeu cau sua chua muc tieu
CREATE TEMPORARY TABLE tmp_req (id BINARY(16) PRIMARY KEY);
INSERT INTO tmp_req SELECT request_id FROM repair_request WHERE equipment_id IN (SELECT id FROM tmp_eq);

-- Tap phieu cong tac muc tieu
CREATE TEMPORARY TABLE tmp_wo (id BINARY(16) PRIMARY KEY);
INSERT INTO tmp_wo SELECT order_id FROM work_order WHERE request_id IN (SELECT id FROM tmp_req);

-- 1. Phieu vat tu tieu hao + phu tung (CASCADE xuong *_request_item)
DELETE FROM consumable_request  WHERE order_id IN (SELECT id FROM tmp_wo);
DELETE FROM spare_part_request  WHERE order_id IN (SELECT id FROM tmp_wo);

-- 2. Lich su sua chua (NO ACTION -> phai xoa truoc equipment)
DELETE FROM repair_history WHERE equipment_id IN (SELECT id FROM tmp_eq)
                              OR order_id     IN (SELECT id FROM tmp_wo);

-- 3. So nhat ky + thanh vien (co CASCADE, xoa tuong minh cho ro rang)
DELETE FROM work_order_daily_log WHERE order_id IN (SELECT id FROM tmp_wo);
DELETE FROM work_order_member    WHERE order_id IN (SELECT id FROM tmp_wo);

-- 4. Phieu cong tac
DELETE FROM work_order WHERE order_id IN (SELECT id FROM tmp_wo);

-- 5. Yeu cau sua chua
DELETE FROM repair_request WHERE request_id IN (SELECT id FROM tmp_req);

-- 6. Danh gia ky thuat (NO ACTION) + anh + thong so (CASCADE)
DELETE FROM technical_assessment WHERE equipment_id IN (SELECT id FROM tmp_eq);
DELETE FROM equipment_image      WHERE equipment_id IN (SELECT id FROM tmp_eq);
DELETE FROM technical_spec       WHERE equipment_id IN (SELECT id FROM tmp_eq);

-- 7. Thiet bi
DELETE FROM equipment WHERE equipment_id IN (SELECT id FROM tmp_eq);

-- 8. He thong (xoa con truoc, cha sau)
DELETE FROM equipment_system WHERE system_id = 0x32000000000000000000000000000002; -- HT-BNC (con)
DELETE FROM equipment_system WHERE system_id IN (
  0x32000000000000000000000000000001,  -- HT-LH
  0x32000000000000000000000000000003,  -- HT-KN
  0x32000000000000000000000000000004); -- HT-DK

DROP TEMPORARY TABLE tmp_eq, tmp_req, tmp_wo;

COMMIT;
