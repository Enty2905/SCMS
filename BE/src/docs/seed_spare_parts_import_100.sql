-- ============================================================
-- SCMS - SEED 100 VẬT TƯ THAY THẾ (VTTT)
-- Bảng: spare_part, spare_part_import, spare_part_import_item
-- CẢNH BÁO: XÓA CỨNG dữ liệu VTTT cũ trước khi tạo lại.
-- Chỉ chạy trên môi trường phát triển/test.
-- ============================================================

USE scms_db;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM spare_part_import_item;
DELETE FROM spare_part_import;
DELETE FROM spare_part;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Danh mục 100 vật tư thay thế
INSERT INTO spare_part (
    spare_part_id, code, name, unit, min_quantity, note, is_deleted
) VALUES
(UUID_TO_BIN(UUID()), 'VTTT-000001', 'Vòng bi SKF 6205', 'Cái', 10, 'Bi cầu rãnh sâu dùng cho động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000002', 'Vòng bi SKF 6206', 'Cái', 10, 'Dùng cho trục bơm công nghiệp', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000003', 'Vòng bi SKF 6207', 'Cái', 8, 'Dùng cho động cơ công suất trung bình', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000004', 'Vòng bi SKF 6308', 'Cái', 6, 'Dùng cho trục tải lớn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000005', 'Vòng bi đũa NJ 210', 'Cái', 5, 'Dùng cho trục bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000006', 'Vòng bi côn 30208', 'Cái', 5, 'Chịu tải hướng kính và hướng trục', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000007', 'Vòng bi chặn 51110', 'Cái', 4, 'Chịu tải dọc trục', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000008', 'Gối đỡ vòng bi UCP205', 'Bộ', 5, 'Gối đỡ trục băng tải', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000009', 'Gối đỡ vòng bi UCP206', 'Bộ', 5, 'Dùng cho quạt công nghiệp', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000010', 'Gối đỡ vòng bi UCF208', 'Bộ', 4, 'Gối đỡ mặt bích vuông', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000011', 'Phớt cơ khí phi 25', 'Bộ', 8, 'Phớt bơm nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000012', 'Phớt cơ khí phi 32', 'Bộ', 8, 'Phớt bơm tuần hoàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000013', 'Phớt cơ khí phi 40', 'Bộ', 6, 'Phớt bơm nước làm mát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000014', 'Phớt dầu 35x52x8', 'Cái', 15, 'Làm kín trục hộp số', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000015', 'Phớt dầu 45x65x10', 'Cái', 15, 'Làm kín trục động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000016', 'Gioăng cao su DN50', 'Cái', 30, 'Gioăng mặt bích đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000017', 'Gioăng cao su DN80', 'Cái', 25, 'Gioăng đường ống nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000018', 'Gioăng PTFE DN100', 'Cái', 20, 'Gioăng chịu hóa chất', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000019', 'Gioăng chì graphite DN150', 'Cái', 10, 'Gioăng chịu nhiệt cao', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000020', 'O-ring NBR 20x3', 'Cái', 50, 'Làm kín xi lanh và van', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000021', 'O-ring NBR 30x4', 'Cái', 50, 'Làm kín thiết bị thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000022', 'O-ring Viton 40x5', 'Cái', 30, 'Chịu dầu và nhiệt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000023', 'Dây cu-roa A42', 'Sợi', 20, 'Truyền động quạt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000024', 'Dây cu-roa A50', 'Sợi', 20, 'Truyền động máy bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000025', 'Dây cu-roa B50', 'Sợi', 15, 'Truyền động động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000026', 'Dây cu-roa B65', 'Sợi', 12, 'Truyền động tải nặng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000027', 'Khớp nối cao su HRC90', 'Bộ', 8, 'Khớp nối trục đàn hồi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000028', 'Khớp nối cao su HRC110', 'Bộ', 6, 'Khớp nối động cơ và bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000029', 'Xích công nghiệp 08B-1', 'Mét', 20, 'Xích truyền động', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000030', 'Nhông xích 08B 20 răng', 'Cái', 8, 'Nhông truyền động', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000031', 'Van bi inox DN15', 'Cái', 20, 'Van khóa đường ống nhỏ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000032', 'Van bi inox DN25', 'Cái', 15, 'Van khóa nước làm mát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000033', 'Van bi inox DN40', 'Cái', 10, 'Van khóa đường ống chính', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000034', 'Van bướm DN50', 'Cái', 10, 'Van điều tiết lưu lượng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000035', 'Van bướm DN100', 'Cái', 6, 'Van đường ống công nghiệp', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000036', 'Van một chiều DN25', 'Cái', 12, 'Ngăn dòng chảy ngược', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000037', 'Van một chiều DN50', 'Cái', 10, 'Dùng cho hệ thống bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000038', 'Van điện từ 24VDC phi 21', 'Cái', 10, 'Điều khiển nước hoặc khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000039', 'Van điện từ 220VAC phi 27', 'Cái', 8, 'Điều khiển tự động', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000040', 'Van giảm áp khí nén AR3000', 'Bộ', 6, 'Điều chỉnh áp suất khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000041', 'Lõi lọc dầu thủy lực 10 micron', 'Lõi', 12, 'Lọc cặn hệ thống thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000042', 'Lõi lọc dầu thủy lực 25 micron', 'Lõi', 12, 'Lọc dầu hồi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000043', 'Lõi lọc khí máy nén', 'Lõi', 10, 'Lọc bụi đầu vào máy nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000044', 'Lõi lọc tách dầu máy nén', 'Lõi', 6, 'Tách dầu khỏi khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000045', 'Lưới lọc Y DN50', 'Cái', 8, 'Lọc rác đầu nguồn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000046', 'Lưới lọc Y DN100', 'Cái', 5, 'Lọc đường ống lớn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000047', 'Bơm dầu bánh răng 1 inch', 'Cái', 4, 'Bơm dầu bôi trơn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000048', 'Bơm ly tâm 1.5kW', 'Cái', 3, 'Bơm nước tuần hoàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000049', 'Bơm chìm 2.2kW', 'Cái', 3, 'Bơm thoát nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000050', 'Cánh bơm inox phi 160', 'Cái', 4, 'Cánh thay thế bơm ly tâm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000051', 'Trục bơm inox phi 30', 'Cái', 3, 'Trục thay thế bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000052', 'Cánh quạt động cơ 5.5kW', 'Cái', 5, 'Làm mát động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000053', 'Cánh quạt động cơ 11kW', 'Cái', 4, 'Làm mát động cơ công suất lớn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000054', 'Tụ điện 20uF 450V', 'Cái', 15, 'Tụ khởi động động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000055', 'Tụ điện 40uF 450V', 'Cái', 12, 'Tụ chạy động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000056', 'Cầu chì 10A 250V', 'Cái', 50, 'Bảo vệ mạch điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000057', 'Cầu chì 32A 500V', 'Cái', 30, 'Bảo vệ mạch động lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000058', 'MCB 1P 16A', 'Cái', 20, 'Aptomat nhánh', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000059', 'MCB 3P 32A', 'Cái', 15, 'Aptomat động lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000060', 'MCCB 3P 100A', 'Cái', 6, 'Bảo vệ tủ phân phối', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000061', 'Contactor 9A 220VAC', 'Cái', 15, 'Đóng cắt động cơ nhỏ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000062', 'Contactor 22A 220VAC', 'Cái', 12, 'Đóng cắt động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000063', 'Contactor 40A 220VAC', 'Cái', 8, 'Đóng cắt tải công suất lớn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000064', 'Rơ le nhiệt 7-10A', 'Cái', 12, 'Bảo vệ quá tải động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000065', 'Rơ le nhiệt 12-18A', 'Cái', 12, 'Bảo vệ động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000066', 'Rơ le trung gian 8 chân 24VDC', 'Cái', 30, 'Dùng trong mạch điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000067', 'Rơ le trung gian 14 chân 24VDC', 'Cái', 30, 'Dùng trong tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000068', 'Đế rơ le 8 chân', 'Cái', 30, 'Đế cắm rơ le', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000069', 'Đế rơ le 14 chân', 'Cái', 30, 'Đế cắm rơ le', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000070', 'Nút nhấn xanh phi 22', 'Cái', 25, 'Nút khởi động', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000071', 'Nút nhấn đỏ phi 22', 'Cái', 25, 'Nút dừng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000072', 'Đèn báo xanh 220V phi 22', 'Cái', 20, 'Báo trạng thái chạy', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000073', 'Đèn báo đỏ 220V phi 22', 'Cái', 20, 'Báo lỗi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000074', 'Công tắc xoay 2 vị trí', 'Cái', 15, 'Chọn chế độ điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000075', 'Công tắc hành trình con lăn', 'Cái', 15, 'Giới hạn hành trình', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000076', 'Cảm biến tiệm cận M18 PNP', 'Cái', 12, 'Phát hiện kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000077', 'Cảm biến quang E3Z', 'Cái', 10, 'Phát hiện vật thể', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000078', 'Cảm biến áp suất 0-10 bar', 'Cái', 8, 'Ngõ ra 4-20mA', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000079', 'Cảm biến áp suất 0-25 bar', 'Cái', 6, 'Đo áp suất hệ thống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000080', 'Cảm biến nhiệt độ PT100', 'Cái', 10, 'Đo nhiệt độ gối bi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000081', 'Cảm biến nhiệt độ K-type', 'Cái', 10, 'Đo nhiệt độ cao', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000082', 'Bộ chuyển đổi nhiệt độ 4-20mA', 'Bộ', 6, 'Chuyển tín hiệu cảm biến', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000083', 'Đồng hồ áp suất 0-10 bar', 'Cái', 10, 'Hiển thị áp suất', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000084', 'Đồng hồ áp suất 0-25 bar', 'Cái', 8, 'Hiển thị áp suất đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000085', 'Đồng hồ nhiệt độ 0-200°C', 'Cái', 8, 'Hiển thị nhiệt độ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000086', 'Biến tần 2.2kW', 'Bộ', 3, 'Điều khiển tốc độ động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000087', 'Biến tần 5.5kW', 'Bộ', 3, 'Điều khiển bơm và quạt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000088', 'Biến tần 7.5kW', 'Bộ', 2, 'Điều khiển động cơ công suất lớn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000089', 'PLC module đầu vào số', 'Bộ', 3, 'Mở rộng đầu vào PLC', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000090', 'PLC module đầu ra số', 'Bộ', 3, 'Mở rộng đầu ra PLC', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000091', 'PLC module analog input', 'Bộ', 2, 'Đọc tín hiệu analog', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000092', 'Nguồn tổ ong 24VDC 5A', 'Bộ', 8, 'Cấp nguồn tủ điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000093', 'Nguồn tổ ong 24VDC 10A', 'Bộ', 6, 'Cấp nguồn thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000094', 'Màn hình HMI 7 inch', 'Cái', 2, 'Màn hình điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000095', 'Màn hình HMI 10 inch', 'Cái', 2, 'Màn hình giám sát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000096', 'Cáp mạng công nghiệp Cat6', 'Mét', 200, 'Kết nối thiết bị điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000097', 'Cáp tín hiệu 2x1.5mm2', 'Mét', 300, 'Dây tín hiệu điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000098', 'Cáp điều khiển 4x1.5mm2', 'Mét', 250, 'Dây điều khiển nhiều lõi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000099', 'Đầu cốt đồng M6', 'Túi', 20, 'Bấm đầu dây điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000100', 'Đầu cốt đồng M8', 'Túi', 20, 'Bấm cáp động lực', b'0');

-- 2. Tạo phiếu nhập kho ban đầu
SET @imported_by = (
    SELECT user_id FROM user WHERE username = 'warehouse_mat' LIMIT 1
);
SET @imported_by = COALESCE(
    @imported_by,
    (SELECT user_id FROM user LIMIT 1)
);

SET @spare_part_import_id = UUID_TO_BIN(UUID());

INSERT INTO spare_part_import (
    import_id, import_number, imported_by, imported_at, note
) VALUES (
    @spare_part_import_id,
    'PN-VTTT-INIT-100',
    @imported_by,
    CURRENT_TIMESTAMP,
    'Phiếu nhập kho đầu kỳ cho 100 vật tư thay thế'
);

-- 3. Chi tiết nhập kho 100 vật tư thay thế
INSERT INTO spare_part_import_item (
    item_id, import_id, spare_part_id, quantity, note
) VALUES
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000001' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000002' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000003' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000004' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000005' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000006' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000007' LIMIT 1), 12, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000008' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000009' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000010' LIMIT 1), 12, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000011' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000012' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000013' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000014' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000015' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000016' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000017' LIMIT 1), 75, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000018' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000019' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000020' LIMIT 1), 150, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000021' LIMIT 1), 150, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000022' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000023' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000024' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000025' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000026' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000027' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000028' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000029' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000030' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000031' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000032' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000033' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000034' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000035' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000036' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000037' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000038' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000039' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000040' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000041' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000042' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000043' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000044' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000045' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000046' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000047' LIMIT 1), 12, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000048' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000049' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000050' LIMIT 1), 12, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000051' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000052' LIMIT 1), 15, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000053' LIMIT 1), 12, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000054' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000055' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000056' LIMIT 1), 150, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000057' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000058' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000059' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000060' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000061' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000062' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000063' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000064' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000065' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000066' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000067' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000068' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000069' LIMIT 1), 90, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000070' LIMIT 1), 75, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000071' LIMIT 1), 75, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000072' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000073' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000074' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000075' LIMIT 1), 45, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000076' LIMIT 1), 36, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000077' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000078' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000079' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000080' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000081' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000082' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000083' LIMIT 1), 30, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000084' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000085' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000086' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000087' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000088' LIMIT 1), 7, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000089' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000090' LIMIT 1), 9, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000091' LIMIT 1), 7, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000092' LIMIT 1), 24, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000093' LIMIT 1), 18, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000094' LIMIT 1), 7, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000095' LIMIT 1), 7, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000096' LIMIT 1), 600, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000097' LIMIT 1), 900, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000098' LIMIT 1), 750, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000099' LIMIT 1), 60, 'Nhập kho đầu kỳ'),
(UUID_TO_BIN(UUID()), @spare_part_import_id, (SELECT spare_part_id FROM spare_part WHERE code = 'VTTT-000100' LIMIT 1), 60, 'Nhập kho đầu kỳ');

-- 4. Kiểm tra dữ liệu
SELECT COUNT(*) AS total_spare_parts
FROM spare_part
WHERE is_deleted = b'0';

SELECT
    BIN_TO_UUID(import_id) AS import_id,
    import_number,
    BIN_TO_UUID(imported_by) AS imported_by,
    imported_at,
    note
FROM spare_part_import;

SELECT COUNT(*) AS total_import_items
FROM spare_part_import_item
WHERE import_id = @spare_part_import_id;

SELECT
    BIN_TO_UUID(sp.spare_part_id) AS spare_part_id,
    sp.code,
    sp.name,
    sp.unit,
    sp.min_quantity,
    COALESCE(SUM(spii.quantity), 0) AS imported_quantity,
    COALESCE(SUM(spii.quantity), 0) AS stock_quantity,
    CASE
        WHEN COALESCE(SUM(spii.quantity), 0) = 0 THEN 'out'
        WHEN COALESCE(SUM(spii.quantity), 0) <= sp.min_quantity THEN 'low'
        ELSE 'available'
    END AS status
FROM spare_part sp
LEFT JOIN spare_part_import_item spii
    ON sp.spare_part_id = spii.spare_part_id
WHERE sp.is_deleted = b'0'
GROUP BY
    sp.spare_part_id,
    sp.code,
    sp.name,
    sp.unit,
    sp.min_quantity
ORDER BY sp.code;
