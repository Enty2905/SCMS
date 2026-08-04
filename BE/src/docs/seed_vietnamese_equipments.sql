SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE scms_db;

-- 1. DELETE EXISTING SAMPLE EQUIPMENT DATA TO PREVENT DUPLICATES
DELETE FROM `technical_spec`;
DELETE FROM `repair_request`;
DELETE FROM `work_order_member`;
DELETE FROM `work_order`;
DELETE FROM `technical_assessment`;
DELETE FROM `equipment_image`;
DELETE FROM `equipment`;
DELETE FROM `equipment_system`;

-- 2. INSERT EQUIPMENT SYSTEMS (6 HỆ THỐNG)
INSERT INTO `equipment_system` (`system_id`, `system_name`, `system_code`, `description`, `parent_system_id`)
VALUES
(UUID_TO_BIN('31000000-0000-0000-0000-000000000001'), 'Hệ thống Lò hơi chính', 'SYS-BOILER', 'Hệ thống lò hơi sinh hơi quá nhiệt cho tuabin', NULL),
(UUID_TO_BIN('31000000-0000-0000-0000-000000000004'), 'Hệ thống Tuabin hơi', 'SYS-TURBINE', 'Hệ thống tuabin biến đổi nhiệt năng hơi thành cơ năng', NULL),
(UUID_TO_BIN('31000000-0000-0000-0000-000000000005'), 'Hệ thống Máy phát điện', 'SYS-GENERATOR', 'Hệ thống máy phát điện va kích từ', NULL),
(UUID_TO_BIN('31000000-0000-0000-0000-000000000006'), 'Hệ thống Xử lý nước', 'SYS-WATER', 'Hệ thống xử lý nước cấp và nước thải nhà máy', NULL),
(UUID_TO_BIN('31000000-0000-0000-0000-000000000002'), 'Đường ống hơi chính', 'SYS-STEAM-PIPE', 'Đường ống dẫn hơi áp lực cao từ bao hơi lò sang tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('31000000-0000-0000-0000-000000000003'), 'Quạt gió lò hơi', 'SYS-BOILER-FAN', 'Hệ thống quạt gió cấp khí và hút khói lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001'));

-- 3. INSERT EQUIPMENTS (120 THIẾT BỊ - 20 MỖI HỆ THỐNG)
INSERT INTO `equipment` (`equipment_id`, `kks_code`, `name`, `type`, `status`, `location`, `system_id`)
VALUES
-- Hệ thống Lò hơi chính (SYS-BOILER)
(UUID_TO_BIN('30000000-0000-0000-0000-000000000001'), '10LAB10AP001', 'Bơm nước cấp lò hơi số 1', 'Cơ khí', 'Hoạt động', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000002'), '10LAB10AP002', 'Bơm nước cấp lò hơi số 2', 'Cơ khí', 'Hoạt động', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000003'), '10LAB10AP003', 'Bơm nước cấp lò hơi số 3', 'Cơ khí', 'Bảo dưỡng', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000004'), '10LAB10ET001', 'Động cơ điện bơm nước cấp số 1', 'Điện', 'Hoạt động', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000005'), '10LAB10ET002', 'Động cơ điện bơm nước cấp số 2', 'Điện', 'Hoạt động', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000006'), '10LAB10ET003', 'Động cơ điện bơm nước cấp số 3', 'Điện', 'Bảo dưỡng', 'Phân xưởng vận hành - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000007'), '10HAC10AT001', 'Bộ hâm nước lò hơi A (Economizer)', 'Cơ khí', 'Hoạt động', 'Phần đuôi lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000008'), '10HAC10AT002', 'Bộ hâm nước lò hơi B (Economizer)', 'Cơ khí', 'Hoạt động', 'Phần đuôi lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000009'), '10HAD10AT001', 'Bao hơi lò hơi (Steam Drum)', 'Cơ khí', 'Hoạt động', 'Đỉnh lò hơi - Cao trình 45m', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000010'), '10HAD20AT001', 'Dàn ống sinh hơi lò hơi (Waterwall)', 'Cơ khí', 'Hoạt động', 'Buồng lửa lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000011'), '10HAD30AT001', 'Bộ quá nhiệt cấp 1 (Superheater 1)', 'Cơ khí', 'Hoạt động', 'Đường khói lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000012'), '10HAD30AT002', 'Bộ quá nhiệt cấp 2 (Superheater 2)', 'Cơ khí', 'Hoạt động', 'Đường khói lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000013'), '10HAD30AT003', 'Bộ quá nhiệt cấp 3 (Superheater 3)', 'Cơ khí', 'Hoạt động', 'Đường khói lò hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000014'), '10HAF10AN001', 'Đầu đốt than số 1', 'Cơ khí', 'Hoạt động', 'Góc buồng lửa - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000015'), '10HAF10AN002', 'Đầu đốt than số 2', 'Cơ khí', 'Hoạt động', 'Góc buồng lửa - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000016'), '10HAF10AN003', 'Đầu đốt than số 3', 'Cơ khí', 'Sự cố', 'Góc buồng lửa - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000017'), '10HAG10AC001', 'Máy nghiền than A (Coal Pulverizer)', 'Cơ khí', 'Hoạt động', 'Nhà nghiền than - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000018'), '10HAG10AC002', 'Máy nghiền than B (Coal Pulverizer)', 'Cơ khí', 'Hoạt động', 'Nhà nghiền than - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-000000000019'), '10HAG10AC003', 'Máy nghiền than C (Coal Pulverizer)', 'Cơ khí', 'Bảo dưỡng', 'Nhà nghiền than - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('30000000-0000-0000-0000-00000000001a'), '10HAH10AA001', 'Van an toàn bao hơi lò hơi', 'Cơ khí', 'Hoạt động', 'Đường hơi bao hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000001')),

-- Đường ống hơi chính (SYS-STEAM-PIPE)
(UUID_TO_BIN('30000000-0000-0000-0001-000000000001'), '10LBA10AA001', 'Van chặn đường hơi chính A', 'Cơ khí', 'Hoạt động', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000002'), '10LBA10AA002', 'Van chặn đường hơi chính B', 'Cơ khí', 'Hoạt động', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000003'), '10LBA10AA003', 'Van chặn đường hơi chính C', 'Cơ khí', 'Bảo dưỡng', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000004'), '10LBA10AA004', 'Van chặn đường hơi chính D', 'Cơ khí', 'Hoạt động', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000005'), '10LBA20AA001', 'Van điều chỉnh áp suất hơi chính A', 'Cơ khí', 'Sự cố', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000006'), '10LBA20AA002', 'Van điều chỉnh áp suất hơi chính B', 'Cơ khí', 'Hoạt động', 'Sàn van chính - Tầng 3', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000007'), '10LBA30AA001', 'Bẫy hơi đường ống chính số 1', 'Cơ khí', 'Hoạt động', 'Đường ống hơi - Điểm thấp nhất', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000008'), '10LBA30AA002', 'Bẫy hơi đường ống chính số 2', 'Cơ khí', 'Hoạt động', 'Đường ống hơi - Điểm thấp nhất', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000009'), '10LBA30AA003', 'Bẫy hơi đường ống chính số 3', 'Cơ khí', 'Sự cố', 'Đường ống hơi - Điểm thấp nhất', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000a'), '10LBA30AA004', 'Bẫy hơi đường ống chính số 4', 'Cơ khí', 'Hoạt động', 'Đường ống hơi - Điểm thấp nhất', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000b'), '10LBA30AA005', 'Bẫy hơi đường ống chính số 5', 'Cơ khí', 'Hoạt động', 'Đường ống hơi - Điểm thấp nhất', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000c'), '10LBA40AA001', 'Van một chiều đường hơi chính A', 'Cơ khí', 'Hoạt động', 'Lối vào tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000d'), '10LBA40AA002', 'Van một chiều đường hơi chính B', 'Cơ khí', 'Hoạt động', 'Lối vào tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000e'), '10LBA50CS001', 'Thiết bị đo lưu lượng hơi chính A', 'CI', 'Hoạt động', 'Đường ống trước tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-00000000000f'), '10LBA50CS002', 'Thiết bị đo lưu lượng hơi chính B', 'CI', 'Hoạt động', 'Đường ống trước tuabin', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000010'), '10LBA60CS001', 'Cảm biến nhiệt độ đường hơi chính T1', 'CI', 'Hoạt động', 'Đo thân ống hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000011'), '10LBA60CS002', 'Cảm biến nhiệt độ đường hơi chính T2', 'CI', 'Hoạt động', 'Đo thân ống hơi', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000012'), '10LBA70CS001', 'Cảm biến áp suất đường hơi chính P1', 'CI', 'Hoạt động', 'Đo áp suất hơi đầu vào', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000013'), '10LBA70CS002', 'Cảm biến áp suất đường hơi chính P2', 'CI', 'Hoạt động', 'Đo áp suất hơi đầu vào', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('30000000-0000-0000-0001-000000000014'), '10LBA70CT001', 'Bộ truyền tín hiệu áp suất hơi chính', 'CI', 'Hoạt động', 'Tủ đo lường tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000002')),

-- Quạt gió lò hơi (SYS-BOILER-FAN)
(UUID_TO_BIN('30000000-0000-0000-0002-000000000001'), '10FAD10AN001', 'Quạt gió cưỡng bức A (FD Fan)', 'Cơ khí', 'Hoạt động', 'Khu vực lò hơi - Ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000002'), '10FAD10AN002', 'Quạt gió cưỡng bức B (FD Fan)', 'Cơ khí', 'Hoạt động', 'Khu vực lò hơi - Ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000003'), '10FAD10ET001', 'Động cơ quạt gió FD Fan A', 'Điện', 'Hoạt động', 'Khu vực lò hơi - Ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000004'), '10FAD10ET002', 'Động cơ quạt gió FD Fan B', 'Điện', 'Bảo dưỡng', 'Khu vực lò hơi - Ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000005'), '10FAD20AN001', 'Quạt khói lò hơi A (ID Fan)', 'Cơ khí', 'Hoạt động', 'Khu vực đuôi lò - Gần ống khói', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000006'), '10FAD20AN002', 'Quạt khói lò hơi B (ID Fan)', 'Cơ khí', 'Hoạt động', 'Khu vực đuôi lò - Gần ống khói', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000007'), '10FAD20ET001', 'Động cơ quạt khói ID Fan A', 'Điện', 'Hoạt động', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000008'), '10FAD20ET002', 'Động cơ quạt khói ID Fan B', 'Điện', 'Hoạt động', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000009'), '10FAD30AN001', 'Quạt gió cấp 2 A (PA Fan)', 'Cơ khí', 'Hoạt động', 'Cạnh quạt FD Fan', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000a'), '10FAD30AN002', 'Quạt gió cấp 2 B (PA Fan)', 'Cơ khí', 'Hoạt động', 'Cạnh quạt FD Fan', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000b'), '10FAD30ET001', 'Động cơ quạt gió PA Fan A', 'Điện', 'Hoạt động', 'Cạnh quạt FD Fan', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000c'), '10FAD30ET002', 'Động cơ quạt gió PA Fan B', 'Điện', 'Hoạt động', 'Cạnh quạt FD Fan', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000d'), '10FAD40AT001', 'Bộ sấy không khí hồi nhiệt A (AH)', 'Cơ khí', 'Hoạt động', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000e'), '10FAD40AT002', 'Bộ sấy không khí hồi nhiệt B (AH)', 'Cơ khí', 'Hoạt động', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-00000000000f'), '10FAD40ET001', 'Động cơ quay bộ sấy không khí A', 'Điện', 'Hoạt động', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000010'), '10FAD40ET002', 'Động cơ quay bộ sấy không khí B', 'Điện', 'Bảo dưỡng', 'Khu vực đuôi lò', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000011'), '10FAD50AA001', 'Cánh hướng dòng quạt FD Fan A', 'Cơ khí', 'Hoạt động', 'Cửa hút quạt FD A', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000012'), '10FAD50AA002', 'Cánh hướng dòng quạt FD Fan B', 'Cơ khí', 'Hoạt động', 'Cửa hút quạt FD B', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000013'), '10FAD60CS001', 'Cảm biến độ rung vòng bi quạt ID A', 'CI', 'Hoạt động', 'Vòng bi quạt ID A', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('30000000-0000-0000-0002-000000000014'), '10FAD60CS002', 'Cảm biến độ rung vòng bi quạt ID B', 'CI', 'Hoạt động', 'Vòng bi quạt ID B', UUID_TO_BIN('31000000-0000-0000-0000-000000000003')),

-- Hệ thống Tuabin hơi (SYS-TURBINE)
(UUID_TO_BIN('30000000-0000-0000-0003-000000000001'), '10MAX10AT001', 'Tuabin hơi cao áp (HP Turbine)', 'Cơ khí', 'Hoạt động', 'Gian máy chính - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000002'), '10MAX20AT001', 'Tuabin hơi trung áp (IP Turbine)', 'Cơ khí', 'Hoạt động', 'Gian máy chính - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000003'), '10MAX30AT001', 'Tuabin hơi hạ áp (LP Turbine)', 'Cơ khí', 'Hoạt động', 'Gian máy chính - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000004'), '10MAX40AT001', 'Gối đỡ trục tuabin số 1', 'Cơ khí', 'Hoạt động', 'Đầu trục tuabin HP', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000005'), '10MAX40AT002', 'Gối đỡ trục tuabin số 2', 'Cơ khí', 'Hoạt động', 'Giữa tuabin HP và IP', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000006'), '10MAX40AT003', 'Gối đỡ trục tuabin số 3', 'Cơ khí', 'Hoạt động', 'Giữa tuabin IP và LP', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000007'), '10MAX40AT004', 'Gối đỡ trục tuabin số 4', 'Cơ khí', 'Hoạt động', 'Đầu trục tuabin LP', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000008'), '10MAX50AP001', 'Bơm dầu bôi trơn trục chính (MOP)', 'Cơ khí', 'Hoạt động', 'Bể dầu trung tâm - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000009'), '10MAX50ET001', 'Động cơ bơm dầu bôi trơn trục chính', 'Điện', 'Hoạt động', 'Bể dầu trung tâm - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000a'), '10GCA10AP001', 'Bơm nước ngưng A', 'Cơ khí', 'Hoạt động', 'Dưới sàn tuabin - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000b'), '10GCA10AP002', 'Bơm nước ngưng B', 'Cơ khí', 'Sự cố', 'Dưới sàn tuabin - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000c'), '10GCA10ET001', 'Động cơ bơm nước ngưng A', 'Điện', 'Hoạt động', 'Dưới sàn tuabin - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000d'), '10GCA10ET002', 'Động cơ bơm nước ngưng B', 'Điện', 'Hoạt động', 'Dưới sàn tuabin - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000e'), '10GCA20AT001', 'Bình ngưng hơi nước (Condenser)', 'Cơ khí', 'Hoạt động', 'Phía dưới chân tuabin LP', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-00000000000f'), '10GCA30AP001', 'Bơm chân không bình ngưng A', 'Cơ khí', 'Hoạt động', 'Cạnh bình ngưng - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000010'), '10GCA30AP002', 'Bơm chân không bình ngưng B', 'Cơ khí', 'Hoạt động', 'Cạnh bình ngưng - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000011'), '10GCA30ET001', 'Động cơ bơm chân không bình ngưng A', 'Điện', 'Hoạt động', 'Cạnh bình ngưng - Tầng 1', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000012'), '10CTY10CT001', 'Tháp giải nhiệt A', 'Cơ khí', 'Hoạt động', 'Khu vực ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000013'), '10LCA20CP001', 'Tủ điều khiển DCS tuabin', 'CI', 'Hoạt động', 'Phòng điều khiển trung tâm', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('30000000-0000-0000-0003-000000000014'), '10LCA30CP001', 'Tủ giám sát rung động vòng bi', 'CI', 'Hoạt động', 'Phòng điều khiển trung tâm', UUID_TO_BIN('31000000-0000-0000-0000-000000000004')),

-- Hệ thống Máy phát điện (SYS-GENERATOR)
(UUID_TO_BIN('30000000-0000-0000-0004-000000000001'), '10MGT10AG001', 'Máy phát điện chính (Generator)', 'Điện', 'Hoạt động', 'Gian máy chính - Tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000002'), '10MGT10AG002', 'Rô-to máy phát điện (Rotor)', 'Điện', 'Hoạt động', 'Trục quay máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000003'), '10MGT10AG003', 'Stato máy phát điện (Stator)', 'Điện', 'Hoạt động', 'Vỏ máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000004'), '10MGT10ET001', 'Hệ thống kích từ không chổi than', 'Điện', 'Hoạt động', 'Đuôi trục máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000005'), '10EYB10ET001', 'Máy biến áp chính (Main Transformer)', 'Điện', 'Hoạt động', 'Trạm biến áp ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000006'), '10EYB20ET001', 'Máy biến áp tự dùng (UAT)', 'Điện', 'Hoạt động', 'Trạm biến áp ngoài trời', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000007'), '10MGT10CP001', 'Tủ máy cắt đầu cực máy phát (GCB)', 'Điện', 'Hoạt động', 'Phòng thiết bị điện', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000008'), '10MGT20AT001', 'Hệ thống làm mát bằng Hydro máy phát', 'Cơ khí', 'Hoạt động', 'Cạnh vỏ máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000009'), '10MGT30AP001', 'Bơm nước làm mát Stato máy phát A', 'Cơ khí', 'Hoạt động', 'Dưới gầm máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000a'), '10MGT30AP002', 'Bơm nước làm mát Stato máy phát B', 'Cơ khí', 'Hoạt động', 'Dưới gầm máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000b'), '10MGT30ET001', 'Động cơ bơm nước làm mát Stato A', 'Điện', 'Hoạt động', 'Dưới gầm máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000c'), '10MGT30ET002', 'Động cơ bơm nước làm mát Stato B', 'Điện', 'Hoạt động', 'Dưới gầm máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000d'), '10MGT40CS001', 'Cảm biến nhiệt độ cuộn dây stator T1', 'CI', 'Hoạt động', 'Khe Stator cuộn dây', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000e'), '10MGT40CS002', 'Cảm biến nhiệt độ cuộn dây stator T2', 'CI', 'Hoạt động', 'Khe Stator cuộn dây', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-00000000000f'), '10MGT40CS003', 'Cảm biến nhiệt độ cuộn dây stator T3', 'CI', 'Hoạt động', 'Khe Stator cuộn dây', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000010'), '10MGT50CP001', 'Bộ điều chỉnh điện áp tự động (AVR)', 'CI', 'Hoạt động', 'Phòng tủ điện điều khiển', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000011'), '10EYB30CP001', 'Tủ điện phân phối 6.6kV số 1', 'Điện', 'Hoạt động', 'Phòng điện trung thế', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000012'), '10EYB30CP002', 'Tủ điện phân phối 6.6kV số 2', 'Điện', 'Hoạt động', 'Phòng điện trung thế', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000013'), '10MGT60CS001', 'Cảm biến phát hiện phóng điện cục bộ', 'CI', 'Hoạt động', 'Đầu cực máy phát', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('30000000-0000-0000-0004-000000000014'), '10EAB20ET002', 'Biến tần ABB số 2', 'Điện', 'Hoạt động', 'PXVH - Tủ điện tầng 2', UUID_TO_BIN('31000000-0000-0000-0000-000000000005')),

-- Hệ thống Xử lý nước (SYS-WATER)
(UUID_TO_BIN('30000000-0000-0000-0005-000000000001'), '10GBA10AP001', 'Bơm nước thô đầu vào A', 'Cơ khí', 'Hoạt động', 'Trạm bơm nước thô sông', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000002'), '10GBA10AP002', 'Bơm nước thô đầu vào B', 'Cơ khí', 'Hoạt động', 'Trạm bơm nước thô sông', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000003'), '10GBA20AP001', 'Bơm định lượng hóa chất phèn A', 'Cơ khí', 'Hoạt động', 'Nhà xử lý hóa chất', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000004'), '10GBA20AP002', 'Bơm định lượng hóa chất phèn B', 'Cơ khí', 'Hoạt động', 'Nhà xử lý hóa chất', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000005'), '10GBA20AP003', 'Bơm định lượng xút châm nước lò A', 'Cơ khí', 'Hoạt động', 'Nhà xử lý hóa chất', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000006'), '10GBA20AP004', 'Bơm định lượng xút châm nước lò B', 'Cơ khí', 'Hoạt động', 'Nhà xử lý hóa chất', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000007'), '10GBB10AT001', 'Bể phản ứng và lắng bùn A', 'Cơ khí', 'Hoạt động', 'Khu xử lý nước thô', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000008'), '10GBB10AT002', 'Bể phản ứng và lắng bùn B', 'Cơ khí', 'Hoạt động', 'Khu xử lý nước thô', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000009'), '10GBB10AT003', 'Bể lọc cát áp lực', 'Cơ khí', 'Bảo dưỡng', 'Nhà xử lý nước', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000a'), '10GBB20AT001', 'Thiết bị lọc than hoạt tính A', 'Cơ khí', 'Hoạt động', 'Nhà xử lý nước', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000b'), '10GBB20AT002', 'Thiết bị lọc than hoạt tính B', 'Cơ khí', 'Hoạt động', 'Nhà xử lý nước', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000c'), '10GBC10AT001', 'Thiết bị trao đổi cation A', 'Cơ khí', 'Hoạt động', 'Dãy cột lọc trao đổi ion', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000d'), '10GBC10AT002', 'Thiết bị trao đổi cation B', 'Cơ khí', 'Hoạt động', 'Dãy cột lọc trao đổi ion', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000e'), '10GBC10AT003', 'Thiết bị trao đổi anion A', 'Cơ khí', 'Hoạt động', 'Dãy cột lọc trao đổi ion', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-00000000000f'), '10GBC10AT004', 'Thiết bị trao đổi anion B', 'Cơ khí', 'Hoạt động', 'Dãy cột lọc trao đổi ion', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000010'), '10GBC20AP001', 'Bơm nước khử khoáng A (Demin Pump)', 'Cơ khí', 'Hoạt động', 'Trạm bơm nước khử khoáng', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000011'), '10GBC20AP002', 'Bơm nước khử khoáng B (Demin Pump)', 'Cơ khí', 'Hoạt động', 'Trạm bơm nước khử khoáng', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000012'), '10GBC30CS001', 'Thiết bị đo độ dẫn điện nước cấp', 'CI', 'Hoạt động', 'Đường ống cấp nước sạch', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000013'), '10GBC30CS002', 'Thiết bị đo độ pH nước cấp lò hơi', 'CI', 'Hoạt động', 'Đường ống cấp nước sạch', UUID_TO_BIN('31000000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('30000000-0000-0000-0005-000000000014'), '10MAB20CP001', 'Máy nén khí số 1', 'Cơ khí', 'Sự cố', 'PXVH - Tầng 2, khu nén khí', UUID_TO_BIN('31000000-0000-0000-0000-000000000006'));

SET FOREIGN_KEY_CHECKS = 1;
