-- =========================================================
-- SCMS - SEED DATA VẬT TƯ + NHẬP KHO VẬT TƯ TIÊU HAO
-- Mục đích:
-- 1) Xóa cứng dữ liệu vật tư hiện có
-- 2) Tạo lại 100 vật tư tiêu hao (consumable)
-- 3) Tạo lại 100 vật tư thay thế (spare_part)
-- 4) Tạo 1 phiếu nhập kho vật tư tiêu hao + 100 dòng chi tiết nhập
-- =========================================================

USE scms_db;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tắt kiểm tra khóa ngoại để xóa cứng dữ liệu cũ an toàn hơn
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu theo thứ tự con -> cha
DELETE FROM consumable_import_item;
DELETE FROM consumable_import;
DELETE FROM consumable;
DELETE FROM spare_part;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. DỮ LIỆU MẪU CHO BẢNG consumable - VẬT TƯ TIÊU HAO
-- =========================================================
INSERT INTO consumable (
    consumable_id, code, name, unit, min_quantity, note, is_deleted
) VALUES
(UUID_TO_BIN(UUID()), 'VTTH-000001', 'Găng tay bảo hộ cotton', 'Đôi', 100, 'Dùng cho nhân viên vận hành', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000002', 'Găng tay cách điện 22kV', 'Đôi', 20, 'Dùng cho thợ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000003', 'Khẩu trang chống bụi', 'Hộp', 50, 'Hộp 50 cái', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000004', 'Dầu bôi trơn công nghiệp Shell', 'Lít', 200, 'Dầu nhờn cho hộp số', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000005', 'Mỡ chịu nhiệt bôi trơn', 'Kg', 50, 'Dùng cho vòng bi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000006', 'Giẻ lau máy cotton', 'Kg', 100, 'Giẻ lau thấm hút tốt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000007', 'Băng keo cách điện đen', 'Cuộn', 200, 'Cách điện hạ thế', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000008', 'Dây thít nhựa 30cm', 'Túi', 150, 'Túi 100 sợi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000009', 'Nước cất châm ắc quy', 'Lít', 100, 'Bảo dưỡng ắc quy 110V', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000010', 'Bóng đèn huỳnh quang 1.2m', 'Bóng', 50, 'Chiếu sáng nhà máy', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000011', 'Bóng đèn LED 15W', 'Bóng', 80, 'Dùng cho văn phòng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000012', 'Pin AA Energizer', 'Viên', 200, 'Dùng cho thiết bị đo lường', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000013', 'Pin AAA Panasonic', 'Viên', 200, 'Dùng cho điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000014', 'Keo dán ống PVC', 'Tuýp', 30, 'Dán ống nước làm mát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000015', 'Băng tan cao su non', 'Cuộn', 100, 'Quấn ren ống nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000016', 'Silicone chịu nhiệt đỏ', 'Tuýp', 20, 'Làm kín mặt bích', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000017', 'Đá cắt sắt 100mm', 'Viên', 150, 'Vật tư tiêu hao cơ khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000018', 'Đá mài hợp kim', 'Viên', 100, 'Dùng mài dao cụ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000019', 'Que hàn KT-421 2.5mm', 'Hộp', 40, 'Que hàn hồ quang', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000020', 'Cuộn dây hàn CO2', 'Cuộn', 20, 'Dây hàn MIG', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000021', 'Mũi khoan thép HSS 5mm', 'Cái', 50, 'Khoan sắt thép', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000022', 'Mũi khoan bê tông 8mm', 'Cái', 30, 'Khoan tường', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000023', 'Dung dịch tẩy rửa RP7', 'Chai', 100, 'Tẩy rỉ sét', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000024', 'Lưỡi cưa sắt', 'Lưỡi', 200, 'Dùng cắt tay', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000025', 'Chổi sơn 5cm', 'Cái', 50, 'Quét sơn bảo dưỡng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000026', 'Sơn chống rỉ mạ kẽm', 'Lon', 30, 'Bảo vệ kết cấu kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000027', 'Bao tải cát 50kg', 'Bao', 100, 'Dùng chống ngập hoặc tràn dầu', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000028', 'Dây đai thắt ống inox', 'Mét', 50, 'Đai xiết đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000029', 'Ống nhựa PVC Phi 27', 'Ống', 50, 'Ống nước dự phòng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000030', 'Ống luồn dây điện ruột gà', 'Cuộn', 20, 'Bảo vệ cáp điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000031', 'Mũ bảo hộ lao động', 'Cái', 50, 'Đội khi vào xưởng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000032', 'Kính bảo hộ chống bụi', 'Cái', 50, 'Đeo khi mài cắt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000033', 'Ủng cao su cách điện', 'Đôi', 20, 'Đi khi ngập nước hoặc khu vực điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000034', 'Mặt nạ phòng độc', 'Cái', 10, 'Dùng khi có khí độc', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000035', 'Lọc bụi cho mặt nạ', 'Cái', 50, 'Thay thế định kỳ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000036', 'Nút tai chống ồn', 'Cặp', 100, 'Dùng trong khu vực turbine', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000037', 'Dây đai an toàn toàn thân', 'Bộ', 20, 'Làm việc trên cao', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000038', 'Bột giặt công nghiệp', 'Kg', 50, 'Giặt đồ bảo hộ hoặc giẻ lau', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000039', 'Nước rửa tay công nghiệp', 'Can', 20, 'Rửa dầu mỡ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000040', 'Nước lau sàn diệt khuẩn', 'Can', 20, 'Vệ sinh văn phòng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000041', 'Chổi đót', 'Cái', 30, 'Quét dọn phân xưởng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000042', 'Cây lau nhà inox', 'Cái', 20, 'Lau sàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000043', 'Sọt rác nhựa 60L', 'Cái', 15, 'Thu gom rác sinh hoạt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000044', 'Thùng rác công nghiệp 120L', 'Cái', 10, 'Thu gom rác thải công nghiệp', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000045', 'Túi đựng rác y tế', 'Kg', 30, 'Thu gom rác nguy hại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000046', 'Biển báo trơn trượt', 'Cái', 10, 'Cảnh báo an toàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000047', 'Ruy băng cảnh báo an toàn', 'Cuộn', 20, 'Rào chắn khu vực nguy hiểm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000048', 'Bình chữa cháy bột ABC 4kg', 'Bình', 30, 'Chữa cháy đa dụng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000049', 'Bình chữa cháy CO2 3kg', 'Bình', 20, 'Chữa cháy điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000050', 'Hộp cứu thương cá nhân', 'Hộp', 15, 'Sơ cấp cứu ban đầu', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000051', 'Dung dịch vệ sinh tiếp điểm điện', 'Chai', 40, 'Làm sạch tiếp điểm và bo mạch', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000052', 'Mỡ đồng chống kẹt ren', 'Tuýp', 20, 'Chống kẹt bulông ở nhiệt độ cao', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000053', 'Dầu thủy lực ISO VG 46', 'Lít', 300, 'Dùng cho hệ thống thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000054', 'Dầu máy nén khí', 'Lít', 150, 'Bôi trơn máy nén khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000055', 'Chất chống gỉ đa năng', 'Chai', 80, 'Bảo vệ bề mặt kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000056', 'Khăn lau công nghiệp không xơ', 'Gói', 60, 'Lau thiết bị và bề mặt chính xác', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000057', 'Găng tay nitrile dùng một lần', 'Hộp', 50, 'Dùng khi tiếp xúc dầu mỡ và hóa chất', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000058', 'Tấm thấm dầu công nghiệp', 'Tấm', 100, 'Xử lý dầu tràn trên sàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000059', 'Cuộn thấm dầu công nghiệp', 'Cuộn', 15, 'Khoanh vùng và thấm hút dầu tràn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000060', 'Hạt hút ẩm silica gel', 'Kg', 30, 'Chống ẩm cho tủ điện và thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000061', 'Găng tay hàn bằng da', 'Đôi', 30, 'Bảo vệ tay khi hàn cắt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000062', 'Kính hàn số 11', 'Tấm', 40, 'Thay cho mặt nạ hàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000063', 'Mặt kính bảo vệ mặt nạ hàn', 'Tấm', 60, 'Bảo vệ kính lọc sáng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000064', 'Đĩa nhám xếp 100mm', 'Viên', 100, 'Mài và đánh bóng kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000065', 'Giấy nhám P120', 'Tờ', 150, 'Chà nhám bề mặt thô', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000066', 'Giấy nhám P400', 'Tờ', 150, 'Chà nhám hoàn thiện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000067', 'Lưỡi cắt inox 100mm', 'Viên', 120, 'Cắt thép không gỉ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000068', 'Mũi taro M6', 'Cái', 30, 'Tạo ren hệ mét M6', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000069', 'Mũi taro M8', 'Cái', 30, 'Tạo ren hệ mét M8', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000070', 'Mũi khoan thép HSS 10mm', 'Cái', 40, 'Khoan kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000071', 'Que hàn inox 308L', 'Hộp', 25, 'Hàn thép không gỉ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000072', 'Que hàn gang', 'Hộp', 15, 'Sửa chữa chi tiết gang', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000073', 'Dây hàn lõi thuốc', 'Cuộn', 20, 'Hàn kết cấu thép', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000074', 'Dung dịch kiểm tra pH', 'Chai', 20, 'Kiểm tra nước xử lý', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000075', 'Giấy quỳ đo pH', 'Hộp', 30, 'Kiểm tra nhanh độ pH', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000076', 'Hóa chất xử lý nước lò hơi', 'Can', 40, 'Ổn định chất lượng nước lò', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000077', 'Chất chống cáu cặn', 'Can', 40, 'Hạn chế đóng cặn đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000078', 'Chất khử oxy hòa tan', 'Can', 30, 'Bảo vệ hệ thống nước lò', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000079', 'Dung dịch vệ sinh cáu cặn', 'Can', 20, 'Tẩy cặn thiết bị trao đổi nhiệt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000080', 'Vải lọc công nghiệp', 'Mét', 100, 'Thay thế vật liệu lọc', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000081', 'Lõi lọc PP 5 micron', 'Lõi', 50, 'Lọc cặn thô trong nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000082', 'Lõi lọc than hoạt tính', 'Lõi', 30, 'Khử mùi và tạp chất hữu cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000083', 'Hộp mực máy in laser', 'Hộp', 15, 'Dùng cho máy in văn phòng', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000084', 'Giấy in A4 80gsm', 'Ram', 50, 'In hồ sơ và biểu mẫu', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000085', 'Bút lông dầu màu đen', 'Cây', 80, 'Đánh dấu vật tư và thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000086', 'Bút đánh dấu sơn màu trắng', 'Cây', 40, 'Đánh dấu trên bề mặt kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000087', 'Nhãn đánh dấu cáp điện', 'Cuộn', 30, 'Nhận diện dây và cáp', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000088', 'Ống co nhiệt phi 6', 'Mét', 100, 'Bọc cách điện đầu nối', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000089', 'Ống co nhiệt phi 10', 'Mét', 100, 'Bọc cách điện đầu nối', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000090', 'Cầu chì ống thủy tinh 5A', 'Hộp', 30, 'Bảo vệ mạch điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000091', 'Dây điện đơn 1.5mm2', 'Cuộn', 20, 'Đi dây điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000092', 'Cáp điện mềm 2x1.5mm2', 'Cuộn', 15, 'Cấp nguồn thiết bị di động', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000093', 'Đầu cos kim 1.5mm2', 'Túi', 50, 'Bấm đầu dây điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000094', 'Keo khóa ren trung bình', 'Chai', 25, 'Chống tự tháo ren', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000095', 'Tấm gioăng cao su 3mm', 'Mét vuông', 30, 'Gia công gioăng làm kín', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000096', 'Tấm gioăng không amiăng 2mm', 'Mét vuông', 20, 'Gia công gioăng chịu nhiệt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000097', 'Dây hàn thiếc 1mm', 'Cuộn', 30, 'Hàn linh kiện điện tử', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000098', 'Thiếc hàn cuộn 0.8mm', 'Cuộn', 30, 'Sửa chữa mạch điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000099', 'Dung dịch trợ hàn', 'Chai', 20, 'Làm sạch mối hàn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTH-000100', 'Pin 9V alkaline', 'Viên', 100, 'Dùng cho đồng hồ và thiết bị đo', b'0');

-- =========================================================
-- 2. DỮ LIỆU MẪU CHO BẢNG spare_part - VẬT TƯ THAY THẾ
-- =========================================================
INSERT INTO spare_part (
    spare_part_id, code, name, unit, min_quantity, note, is_deleted
) VALUES
(UUID_TO_BIN(UUID()), 'VTTT-000001', 'Vòng bi SKF 6205', 'Cái', 10, 'Bi cầu rãnh sâu', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000002', 'Vòng bi đũa NJ 210', 'Cái', 5, 'Dùng cho trục bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000003', 'Phớt cơ khí Phi 40', 'Bộ', 8, 'Phớt bơm nước làm mát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000004', 'Dây cu-roa B50', 'Sợi', 20, 'Truyền động động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000005', 'Cánh quạt làm mát động cơ 11kW', 'Cái', 3, 'Vật liệu nhựa chịu nhiệt', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000006', 'Gioăng mặt bích DN100', 'Cái', 50, 'Vật liệu PTFE', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000007', 'Van bi inox 304 phi 34', 'Cái', 15, 'Van khóa nước làm mát', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000008', 'Van một chiều lò xo phi 42', 'Cái', 10, 'Ngăn chảy ngược', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000009', 'Lưới lọc thô Y-Type DN50', 'Cái', 5, 'Lọc rác đầu nguồn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000010', 'Cầu chì 10A 250V', 'Quả', 100, 'Dùng cho tủ điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000011', 'Khởi động từ 22A', 'Bộ', 10, 'Thiết bị đóng cắt động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000012', 'Rơ le nhiệt 12-18A', 'Cái', 15, 'Bảo vệ quá tải', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000013', 'Aptomat MCB 3 pha 63A', 'Cái', 8, 'Dùng cho tủ phân phối', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000014', 'Biến tần 7.5kW', 'Bộ', 2, 'Điều khiển tốc độ động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000015', 'Cảm biến áp suất 0-10 Bar', 'Cái', 5, 'Ngõ ra 4-20mA', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000016', 'Cảm biến nhiệt độ PT100', 'Cái', 10, 'Đo nhiệt độ gối bi', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000017', 'Công tắc hành trình', 'Cái', 20, 'Limit switch cho cửa', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000018', 'Đồng hồ áp suất mặt dầu 1Mpa', 'Cái', 10, 'Hiển thị áp suất đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000019', 'Role trung gian 14 chân 24VDC', 'Cái', 30, 'Dùng trong mạch điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000020', 'Đế role trung gian', 'Cái', 30, 'Đế cắm role 14 chân', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000021', 'PLC Module đầu vào số', 'Bộ', 1, 'Mở rộng DI cho PLC', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000022', 'Màn hình HMI 7 inch', 'Cái', 1, 'Màn hình cảm ứng điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000023', 'Bo mạch điều khiển kích từ', 'Bo', 2, 'Phụ tùng tủ kích từ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000024', 'Bơm dầu nhớt trục răng', 'Cái', 2, 'Bơm dầu bôi trơn turbine', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000025', 'Bộ lọc dầu thủy lực', 'Lõi', 10, 'Lọc cặn dầu', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000026', 'Xi lanh khí nén phi 50 hành trình 100', 'Cái', 4, 'Dùng đóng mở van', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000027', 'Van điện từ 24V', 'Cái', 10, 'Điều khiển khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000028', 'Pin lưu điện PLC Lithium 3V', 'Viên', 20, 'Backup data PLC', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000029', 'Cáp mạng công nghiệp Cat6', 'Mét', 500, 'Dây truyền thông Profinet', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000030', 'Đầu cốt đồng M8', 'Túi', 20, 'Bấm cáp điện động lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000031', 'Relay bảo vệ mất pha', 'Cái', 8, 'Bảo vệ động cơ 3 pha', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000032', 'Bộ nguồn 24VDC 10A', 'Bộ', 5, 'Nguồn tủ điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000033', 'Module analog input PLC', 'Bộ', 2, 'Mở rộng AI cho PLC', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000034', 'Cảm biến mức nước siêu âm', 'Cái', 4, 'Đo mức bể nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000035', 'Cảm biến rung động', 'Cái', 4, 'Giám sát rung động máy', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000036', 'Đồng hồ đo lưu lượng DN50', 'Cái', 3, 'Đo lưu lượng nước', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000037', 'Bộ lọc khí nén', 'Bộ', 6, 'Lọc khí cho hệ thống khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000038', 'Van giảm áp khí nén', 'Cái', 6, 'Điều chỉnh áp suất khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000039', 'Đồng hồ đo áp khí nén', 'Cái', 10, 'Hiển thị áp suất khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000040', 'Khớp nối mềm DN80', 'Cái', 5, 'Giảm rung đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000041', 'Ống mềm thủy lực 1/2 inch', 'Mét', 50, 'Dùng cho hệ thống thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000042', 'Đầu nối nhanh khí nén phi 8', 'Cái', 30, 'Kết nối ống khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000043', 'Cầu đấu điện 20A', 'Thanh', 20, 'Đấu nối trong tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000044', 'Thanh ray DIN 35mm', 'Mét', 30, 'Lắp thiết bị điện tủ điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000045', 'Đèn báo pha 220V', 'Cái', 20, 'Hiển thị trạng thái nguồn', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000046', 'Nút nhấn khẩn cấp', 'Cái', 10, 'Dừng khẩn cấp thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000047', 'Công tắc xoay 3 vị trí', 'Cái', 15, 'Chọn chế độ vận hành', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000048', 'Bộ chia tín hiệu 4-20mA', 'Bộ', 4, 'Chia tín hiệu analog', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000049', 'Quạt tản nhiệt tủ điện 220V', 'Cái', 10, 'Làm mát tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000050', 'Lọc bụi tủ điện', 'Cái', 20, 'Thay định kỳ cho quạt tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000051', 'Khởi động từ 40A', 'Bộ', 8, 'Đóng cắt động cơ công suất trung bình', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000052', 'Rơ le nhiệt 23-32A', 'Cái', 8, 'Bảo vệ quá tải động cơ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000053', 'Aptomat MCB 2 pha 32A', 'Cái', 15, 'Bảo vệ nhánh điện một pha', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000054', 'Aptomat MCCB 3 pha 100A', 'Cái', 5, 'Bảo vệ tủ phân phối', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000055', 'Aptomat chống rò RCCB 4 pha 63A', 'Cái', 5, 'Bảo vệ dòng rò', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000056', 'Tiếp điểm phụ cho contactor', 'Cái', 20, 'Mở rộng tiếp điểm điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000057', 'Bộ nguồn 24VDC 10A', 'Bộ', 6, 'Cấp nguồn cho PLC và cảm biến', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000058', 'Biến áp điều khiển 220V sang 24V', 'Bộ', 5, 'Cấp nguồn mạch điều khiển', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000059', 'Biến dòng 100/5A', 'Cái', 12, 'Đo dòng điện trong tủ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000060', 'Đồng hồ điện áp số', 'Cái', 8, 'Hiển thị điện áp tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000061', 'Đồng hồ dòng điện số', 'Cái', 8, 'Hiển thị dòng tải', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000062', 'Rơ le thứ tự pha', 'Cái', 8, 'Giám sát mất pha và đảo pha', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000063', 'Rơ le thời gian 220V', 'Cái', 12, 'Điều khiển trễ thời gian', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000064', 'Rơ le bán dẫn SSR 40A', 'Cái', 8, 'Đóng cắt tải điện trở', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000065', 'Cảm biến tiệm cận M18', 'Cái', 10, 'Phát hiện vật kim loại', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000066', 'Cảm biến quang phản xạ', 'Cái', 8, 'Phát hiện vật thể không tiếp xúc', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000067', 'Công tắc phao mức nước', 'Cái', 10, 'Điều khiển mức bể', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000068', 'Bộ truyền mức 0-5m', 'Cái', 4, 'Đo mức chất lỏng liên tục', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000069', 'Bộ truyền áp suất 0-16 Bar', 'Cái', 5, 'Đo áp suất đường ống', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000070', 'Cặp nhiệt điện loại K', 'Cái', 10, 'Đo nhiệt độ cao', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000071', 'Bộ chuyển đổi tín hiệu PT100', 'Bộ', 6, 'Chuyển tín hiệu nhiệt độ sang 4-20mA', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000072', 'Encoder quay 1024 xung', 'Cái', 4, 'Đo tốc độ và vị trí trục', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000073', 'Công tắc hành trình con lăn', 'Cái', 15, 'Giới hạn hành trình cơ khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000074', 'Nút nhấn màu xanh 22mm', 'Cái', 20, 'Lệnh khởi động thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000075', 'Nút nhấn màu đỏ 22mm', 'Cái', 20, 'Lệnh dừng thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000076', 'Công tắc xoay 2 vị trí', 'Cái', 15, 'Chọn chế độ vận hành', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000077', 'Cầu đấu tiếp địa', 'Thanh', 15, 'Đấu nối dây bảo vệ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000078', 'Cầu đấu trung tính', 'Thanh', 15, 'Đấu nối dây trung tính', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000079', 'Bộ điều nhiệt tủ điện', 'Cái', 8, 'Điều khiển quạt hoặc sưởi tủ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000080', 'Điện trở sưởi tủ điện 100W', 'Cái', 8, 'Chống ẩm trong tủ điện', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000081', 'Cuộn coil van điện từ 24VDC', 'Cái', 12, 'Thay thế coil van khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000082', 'Van khí nén 5/2', 'Cái', 8, 'Điều khiển xi lanh tác động kép', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000083', 'Ống khí nén PU phi 8', 'Mét', 100, 'Dẫn khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000084', 'Xi lanh khí nén phi 32 hành trình 200', 'Cái', 5, 'Cơ cấu chấp hành khí nén', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000085', 'Công tắc áp suất khí nén', 'Cái', 8, 'Giám sát áp suất khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000086', 'Đồng hồ áp suất thủy lực 0-250 Bar', 'Cái', 6, 'Hiển thị áp suất thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000087', 'Lõi lọc thủy lực 10 micron', 'Lõi', 10, 'Lọc dầu thủy lực', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000088', 'Phớt dầu 35x52x8', 'Cái', 20, 'Làm kín trục quay', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000089', 'Bộ vòng đệm O-ring NBR', 'Bộ', 10, 'Sửa chữa hệ thống dầu và khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000090', 'Phớt cơ khí Phi 25', 'Bộ', 8, 'Thay thế phớt bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000091', 'Vòng bi SKF 6306', 'Cái', 10, 'Dùng cho động cơ và bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000092', 'Vòng bi SKF 6208', 'Cái', 10, 'Dùng cho trục thiết bị', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000093', 'Khớp nối mềm L-095', 'Bộ', 6, 'Nối trục động cơ và bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000094', 'Nhông xích 40 răng', 'Cái', 5, 'Truyền động xích', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000095', 'Xích con lăn 08B', 'Mét', 30, 'Truyền động cơ khí', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000096', 'Dây đai răng HTD 8M', 'Sợi', 10, 'Truyền động đồng bộ', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000097', 'Puly đai B hai rãnh', 'Cái', 5, 'Truyền động bằng dây cu-roa', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000098', 'Cánh bơm DN50', 'Cái', 4, 'Thay thế cho bơm ly tâm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000099', 'Ống lót trục bơm', 'Cái', 6, 'Bảo vệ trục bơm', b'0'),
(UUID_TO_BIN(UUID()), 'VTTT-000100', 'Cánh quạt làm mát động cơ 22kW', 'Cái', 4, 'Làm mát động cơ công suất lớn', b'0');

-- =========================================================
-- 3. TẠO 1 PHIẾU NHẬP KHO CHO 100 VẬT TƯ TIÊU HAO
-- =========================================================

-- Lấy người nhập: ưu tiên username warehouse_mat, nếu không có thì lấy user đầu tiên, nếu chưa có user thì để NULL
SET @imported_by = (
    SELECT user_id FROM `user` WHERE username = 'warehouse_mat' LIMIT 1
);
SET @imported_by = COALESCE(@imported_by, (SELECT user_id FROM `user` LIMIT 1));

SET @import_id = UUID_TO_BIN(UUID());

INSERT INTO consumable_import (
    import_id, import_number, imported_by, imported_at, note
) VALUES (
    @import_id,
    'PN-VTTH-INIT-001',
    @imported_by,
    CURRENT_TIMESTAMP,
    'Phiếu nhập kho đầu kỳ cho 100 vật tư tiêu hao'
);

-- =========================================================
-- 4. CHI TIẾT PHIẾU NHẬP - 100 DÒNG consumable_import_item
-- =========================================================
INSERT INTO consumable_import_item (
    item_id, import_id, consumable_id, quantity, note
) VALUES
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000001'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000002'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000003'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000004'), 250, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000005'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000006'), 120, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000007'), 180, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000008'), 200, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000009'), 90, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000010'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000011'), 150, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000012'), 300, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000013'), 220, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000014'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000015'), 120, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000016'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000017'), 150, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000018'), 90, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000019'), 80, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000020'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000021'), 70, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000022'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000023'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000024'), 250, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000025'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000026'), 35, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000027'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000028'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000029'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000030'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000031'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000032'), 90, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000033'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000034'), 12, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000035'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000036'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000037'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000038'), 80, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000039'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000040'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000041'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000042'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000043'), 15, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000044'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000045'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000046'), 10, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000047'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000048'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000049'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000050'), 15, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000051'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000052'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000053'), 400, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000054'), 200, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000055'), 100, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000056'), 90, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000057'), 70, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000058'), 150, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000059'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000060'), 45, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000061'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000062'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000063'), 80, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000064'), 130, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000065'), 200, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000066'), 180, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000067'), 150, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000068'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000069'), 35, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000070'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000071'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000072'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000073'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000074'), 35, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000075'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000076'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000077'), 55, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000078'), 45, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000079'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000080'), 120, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000081'), 80, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000082'), 55, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000083'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000084'), 75, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000085'), 90, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000086'), 60, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000087'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000088'), 150, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000089'), 140, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000090'), 50, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000091'), 25, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000092'), 20, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000093'), 80, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000094'), 35, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000095'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000096'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000097'), 45, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000098'), 40, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000099'), 30, 'Nhập đầu kỳ'),
(UUID_TO_BIN(UUID()), @import_id, (SELECT consumable_id FROM consumable WHERE code = 'VTTH-000100'), 120, 'Nhập đầu kỳ');

-- =========================================================
-- 5. CÂU LỆNH KIỂM TRA SAU KHI CHẠY FILE
-- =========================================================

-- Kiểm tra số dòng danh mục vật tư tiêu hao
SELECT COUNT(*) AS total_consumable FROM consumable;

-- Kiểm tra số dòng vật tư thay thế
SELECT COUNT(*) AS total_spare_part FROM spare_part;

-- Kiểm tra phiếu nhập kho
SELECT
    BIN_TO_UUID(import_id) AS import_id,
    import_number,
    BIN_TO_UUID(imported_by) AS imported_by,
    imported_at,
    note
FROM consumable_import;

-- Kiểm tra 100 dòng chi tiết nhập kho
SELECT COUNT(*) AS total_import_items FROM consumable_import_item;

-- Kiểm tra tồn kho vật tư tiêu hao
SELECT
    c.code,
    c.name,
    c.unit,
    c.min_quantity,
    COALESCE(SUM(cii.quantity), 0) AS imported_quantity,
    COALESCE(SUM(cii.quantity), 0) AS stock_quantity,
    CASE
        WHEN COALESCE(SUM(cii.quantity), 0) = 0 THEN 'out'
        WHEN COALESCE(SUM(cii.quantity), 0) <= c.min_quantity THEN 'low'
        ELSE 'available'
    END AS status
FROM consumable c
LEFT JOIN consumable_import_item cii
    ON c.consumable_id = cii.consumable_id
WHERE c.is_deleted IS NULL OR c.is_deleted = b'0'
GROUP BY
    c.consumable_id,
    c.code,
    c.name,
    c.unit,
    c.min_quantity
ORDER BY c.code;
