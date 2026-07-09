-- ==========================================
-- SCRIPT TẠO DỮ LIỆU TEST SPRINT 1 (SCMS)
-- Lưu ý: Cơ sở dữ liệu dùng BINARY(16) cho UUID, nên ta dùng UUID_TO_BIN(UUID()) (Yêu cầu MySQL 8.0+)
-- ==========================================

-- 1. THÊM PHÒNG BAN (Department) - 5 bản ghi
INSERT INTO department (id, name, description, created_at, updated_at) VALUES 
(UUID_TO_BIN(UUID()), 'Phòng Hành chính Nhân sự', 'Quản lý nhân sự và hành chính', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'Phòng Vận hành Sản xuất', 'Điều hành dây chuyền sản xuất', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'Phòng Quản lý Kho', 'Quản lý vật tư, phụ tùng, CCDC', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'Phòng Kỹ thuật Bảo trì', 'Sửa chữa và bảo dưỡng thiết bị', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'Ban Giám Đốc', 'Quản lý và điều hành chung', NOW(), NOW());

-- 2. THÊM TÀI KHOẢN (Users) - 20 bản ghi
-- Mật khẩu mặc định là '123456' đã được băm bằng BCrypt ($2a$10$DowX... là mã băm của 123456)
INSERT INTO users (id, username, password, status, created_at, updated_at) VALUES 
(UUID_TO_BIN(UUID()), 'admin_tong', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'hr_manager', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'kho_vattu1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'kho_vattu2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'kho_ccdc1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'kho_ccdc2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'vanhanh_truong', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'vanhanh_ca1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'vanhanh_ca2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'vanhanh_ca3', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'baotri_truong', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'baotri_to1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'baotri_to2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'tho_dien1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'tho_dien2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'tho_cokhi1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'tho_cokhi2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'tho_cokhi3', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'user_nhap1', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN(UUID()), 'user_nhap2', '$2a$10$DowXsWl2G4oD/7MZh9O9/uyx2D.g7Kk8T6jX2zD5YfF9aJ4T9LzM6', 'ACTIVE', NOW(), NOW());

-- 3. THÊM THIẾT BỊ (Equipment) - 20 bản ghi
INSERT INTO equipment (equipment_id, kks_code, name, type, status, location) VALUES 
(UUID_TO_BIN(UUID()), 'KKS-PUMP-001', 'Bơm nước làm mát tuần hoàn A', 'Bơm ly tâm', 'active', 'Xưởng Nước 1'),
(UUID_TO_BIN(UUID()), 'KKS-PUMP-002', 'Bơm nước làm mát tuần hoàn B', 'Bơm ly tâm', 'maintenance', 'Xưởng Nước 1'),
(UUID_TO_BIN(UUID()), 'KKS-PUMP-003', 'Bơm cứu hỏa Diesel', 'Bơm cao áp', 'active', 'Trạm Cứu hỏa'),
(UUID_TO_BIN(UUID()), 'KKS-PUMP-004', 'Bơm cấp nước nồi hơi 1', 'Bơm cao áp', 'active', 'Nhà máy Nhiệt 1'),
(UUID_TO_BIN(UUID()), 'KKS-PUMP-005', 'Bơm cấp nước nồi hơi 2', 'Bơm cao áp', 'broken', 'Nhà máy Nhiệt 1'),
(UUID_TO_BIN(UUID()), 'KKS-COMP-001', 'Máy nén khí trục vít Atlas Copco 1', 'Máy nén khí', 'active', 'Trạm Khí Nén'),
(UUID_TO_BIN(UUID()), 'KKS-COMP-002', 'Máy nén khí trục vít Atlas Copco 2', 'Máy nén khí', 'active', 'Trạm Khí Nén'),
(UUID_TO_BIN(UUID()), 'KKS-COMP-003', 'Máy nén khí ly tâm', 'Máy nén khí', 'inactive', 'Trạm Khí Nén 2'),
(UUID_TO_BIN(UUID()), 'KKS-VALVE-001', 'Van điều khiển tự động tuyến tính V1', 'Van điều khiển', 'active', 'Khu A'),
(UUID_TO_BIN(UUID()), 'KKS-VALVE-002', 'Van an toàn hơi bão hòa', 'Van an toàn', 'active', 'Nồi hơi 1'),
(UUID_TO_BIN(UUID()), 'KKS-VALVE-003', 'Van bướm DN200', 'Van đóng ngắt', 'maintenance', 'Xưởng Nước 1'),
(UUID_TO_BIN(UUID()), 'KKS-VALVE-004', 'Van một chiều hệ thống PCCC', 'Van một chiều', 'active', 'Trạm Cứu hỏa'),
(UUID_TO_BIN(UUID()), 'KKS-VALVE-005', 'Van giảm áp đường ống chính', 'Van giảm áp', 'active', 'Xưởng Chính'),
(UUID_TO_BIN(UUID()), 'KKS-GEN-001', 'Máy phát điện dự phòng Cummins 1000kVA', 'Máy phát điện', 'active', 'Nhà xe B'),
(UUID_TO_BIN(UUID()), 'KKS-GEN-002', 'Máy phát điện Mitsubishi 500kVA', 'Máy phát điện', 'active', 'Nhà điều hành'),
(UUID_TO_BIN(UUID()), 'KKS-HVAC-001', 'Hệ thống AHU điều hòa trung tâm 1', 'HVAC', 'broken', 'Tòa nhà văn phòng'),
(UUID_TO_BIN(UUID()), 'KKS-HVAC-002', 'Hệ thống Chiller giải nhiệt nước 1', 'HVAC', 'active', 'Tòa nhà văn phòng'),
(UUID_TO_BIN(UUID()), 'KKS-TRANS-001', 'Máy biến áp phân phối 22/0.4kV', 'Máy biến áp', 'active', 'Trạm điện chính'),
(UUID_TO_BIN(UUID()), 'KKS-TRANS-002', 'Tủ điện tổng MSB-01', 'Tủ điện', 'active', 'Trạm điện chính'),
(UUID_TO_BIN(UUID()), 'KKS-MOTOR-001', 'Động cơ kéo băng tải than', 'Động cơ điện', 'active', 'Xưởng than');

-- 4. THÊM VẬT TƯ TIÊU HAO (Consumable) - 20 bản ghi
INSERT INTO consumable (id, code, name, unit, min_stock, current_stock) VALUES 
(UUID_TO_BIN(UUID()), 'VT-OIL-001', 'Dầu nhờn Shell Corena S2', 'Lít', 50, 120),
(UUID_TO_BIN(UUID()), 'VT-OIL-002', 'Dầu thủy lực Castrol Hyspin', 'Lít', 100, 250),
(UUID_TO_BIN(UUID()), 'VT-OIL-003', 'Mỡ bôi trơn SKF chịu nhiệt', 'Hộp', 10, 45),
(UUID_TO_BIN(UUID()), 'VT-CLEAN-01', 'Dung dịch tẩy rửa đa năng RP7', 'Chai', 20, 80),
(UUID_TO_BIN(UUID()), 'VT-CLEAN-02', 'Hóa chất xúc rửa đường ống', 'Can', 5, 12),
(UUID_TO_BIN(UUID()), 'VT-CLEAN-03', 'Cồn công nghiệp 90 độ', 'Lít', 30, 50),
(UUID_TO_BIN(UUID()), 'VT-WELD-001', 'Que hàn chịu lực E7018 3.2mm', 'Kg', 100, 320),
(UUID_TO_BIN(UUID()), 'VT-WELD-002', 'Que hàn Inox 304 2.5mm', 'Kg', 50, 150),
(UUID_TO_BIN(UUID()), 'VT-WELD-003', 'Khí Argon tinh khiết', 'Bình', 10, 18),
(UUID_TO_BIN(UUID()), 'VT-SAFE-001', 'Găng tay sợi tráng cao su', 'Đôi', 200, 450),
(UUID_TO_BIN(UUID()), 'VT-SAFE-002', 'Găng tay da hàn dài', 'Đôi', 50, 85),
(UUID_TO_BIN(UUID()), 'VT-SAFE-003', 'Kính bảo hộ chống đọng sương', 'Cái', 100, 210),
(UUID_TO_BIN(UUID()), 'VT-SAFE-004', 'Mũ bảo hộ công trường màu vàng', 'Cái', 30, 70),
(UUID_TO_BIN(UUID()), 'VT-SAFE-005', 'Khẩu trang lọc bụi 3M', 'Hộp', 20, 55),
(UUID_TO_BIN(UUID()), 'VT-MISC-001', 'Giẻ lau máy cotton công nghiệp', 'Kg', 150, 300),
(UUID_TO_BIN(UUID()), 'VT-MISC-002', 'Băng keo điện Nano', 'Cuộn', 100, 250),
(UUID_TO_BIN(UUID()), 'VT-MISC-003', 'Dây rút nhựa 30cm trắng', 'Gói', 50, 120),
(UUID_TO_BIN(UUID()), 'VT-MISC-004', 'Dây rút nhựa 20cm đen', 'Gói', 50, 90),
(UUID_TO_BIN(UUID()), 'VT-MISC-005', 'Keo dán silicon chịu nhiệt đỏ', 'Tuýp', 15, 32),
(UUID_TO_BIN(UUID()), 'VT-MISC-006', 'Giấy giáp xếp đánh bóng hạt 60', 'Tờ', 200, 500);

-- 5. THÊM VẬT TƯ THAY THẾ (Spare Part) - 20 bản ghi
INSERT INTO spare_part (id, code, name, specifications, manufacturer, min_stock, current_stock) VALUES 
(UUID_TO_BIN(UUID()), 'SP-BRG-001', 'Vòng bi cầu SKF 6205', 'Lỗ 25mm, ĐK 52mm', 'SKF', 10, 25),
(UUID_TO_BIN(UUID()), 'SP-BRG-002', 'Vòng bi tang trống SKF 22216', 'Lỗ 80mm', 'SKF', 5, 12),
(UUID_TO_BIN(UUID()), 'SP-BRG-003', 'Vòng bi đũa FAG NU310', 'Lỗ 50mm', 'FAG', 5, 8),
(UUID_TO_BIN(UUID()), 'SP-BELT-001', 'Dây curoa bản B-65', 'Loại B', 'Bando', 20, 50),
(UUID_TO_BIN(UUID()), 'SP-BELT-002', 'Dây curoa răng 8M-1200', 'Bước 8mm', 'Mitsuboshi', 10, 30),
(UUID_TO_BIN(UUID()), 'SP-SEAL-001', 'Phớt cơ khí trục 35mm', 'Vật liệu SIC/SIC', 'EagleBurgmann', 5, 15),
(UUID_TO_BIN(UUID()), 'SP-SEAL-002', 'Phớt chắn dầu 40x60x10', 'Vật liệu NBR', 'NOK', 20, 60),
(UUID_TO_BIN(UUID()), 'SP-SEAL-003', 'Gioăng O-ring viton phi 50', 'Chịu nhiệt 200C', 'Parker', 50, 120),
(UUID_TO_BIN(UUID()), 'SP-ELEC-001', 'Contactor 3P 32A', 'Cuộn coil 220VAC', 'Schneider', 10, 28),
(UUID_TO_BIN(UUID()), 'SP-ELEC-002', 'Rơ le nhiệt 12-18A', 'Tương thích K32', 'Schneider', 10, 22),
(UUID_TO_BIN(UUID()), 'SP-ELEC-003', 'CB tép MCB 2P 16A', 'Dòng cắt 6kA', 'LS', 30, 80),
(UUID_TO_BIN(UUID()), 'SP-ELEC-004', 'Biến tần 5.5kW', 'Vào 3P 380V', 'Yaskawa', 2, 5),
(UUID_TO_BIN(UUID()), 'SP-SENS-001', 'Cảm biến áp suất 0-10 bar', 'Ngõ ra 4-20mA', 'Danfoss', 5, 14),
(UUID_TO_BIN(UUID()), 'SP-SENS-002', 'Cảm biến nhiệt độ PT100', 'Dài 100mm, ren 1/2', 'Wika', 10, 25),
(UUID_TO_BIN(UUID()), 'SP-SENS-003', 'Cảm biến tiệm cận từ tính', 'PNP NO M18', 'Autonics', 15, 35),
(UUID_TO_BIN(UUID()), 'SP-VALV-001', 'Cụm ruột van an toàn nồi hơi', 'Áp suất đặt 8 bar', 'ARI', 2, 6),
(UUID_TO_BIN(UUID()), 'SP-VALV-002', 'Đầu kích động điện (Actuator)', '24VDC', 'Rotork', 1, 3),
(UUID_TO_BIN(UUID()), 'SP-FILT-001', 'Lõi lọc dầu thủy lực', 'Độ tinh lọc 10 micron', 'Hydac', 20, 45),
(UUID_TO_BIN(UUID()), 'SP-FILT-002', 'Tấm lọc gió điều hòa AHU', 'Kích thước 600x600', 'Camfil', 30, 80),
(UUID_TO_BIN(UUID()), 'SP-FILT-003', 'Bộ lọc tách nước máy nén khí', 'Ren 1 inch', 'SMC', 5, 12);

-- 6. THÊM CÔNG CỤ DỤNG CỤ (Tools) - 20 bản ghi
INSERT INTO tool (id, code, name, current_stock) VALUES 
(UUID_TO_BIN(UUID()), 'CC-001', 'Máy mài góc cầm tay Bosch GWS', 5),
(UUID_TO_BIN(UUID()), 'CC-002', 'Máy khoan búa Makita', 4),
(UUID_TO_BIN(UUID()), 'CC-003', 'Máy hàn que Inverter Hồng Ký', 3),
(UUID_TO_BIN(UUID()), 'CC-004', 'Máy cắt sắt bàn 350mm', 2),
(UUID_TO_BIN(UUID()), 'CC-005', 'Bộ cờ lê tròng 8-32mm Yato', 10),
(UUID_TO_BIN(UUID()), 'CC-006', 'Bộ khẩu tuýp 1/2 inch', 8),
(UUID_TO_BIN(UUID()), 'CC-007', 'Cờ lê lực 20-200Nm', 3),
(UUID_TO_BIN(UUID()), 'CC-008', 'Kìm mỏ quạ 12 inch', 15),
(UUID_TO_BIN(UUID()), 'CC-009', 'Kìm cắt cáp điện chuyên dụng', 10),
(UUID_TO_BIN(UUID()), 'CC-010', 'Đồng hồ vạn năng số Fluke 17B+', 6),
(UUID_TO_BIN(UUID()), 'CC-011', 'Ampe kìm đo dòng AC/DC Kyoritsu', 5),
(UUID_TO_BIN(UUID()), 'CC-012', 'Đồng hồ đo điện trở cách điện (Megger)', 2),
(UUID_TO_BIN(UUID()), 'CC-013', 'Máy đo rung động vòng bi cầm tay', 1),
(UUID_TO_BIN(UUID()), 'CC-014', 'Súng bắn nhiệt độ hồng ngoại', 4),
(UUID_TO_BIN(UUID()), 'CC-015', 'Pa lăng xích kéo tay 2 Tấn', 3),
(UUID_TO_BIN(UUID()), 'CC-016', 'Con đội thủy lực (Kích) 10 Tấn', 4),
(UUID_TO_BIN(UUID()), 'CC-017', 'Vam cảo vòng bi 3 chấu', 5),
(UUID_TO_BIN(UUID()), 'CC-018', 'Bộ cờ lê đóng cỡ lớn 36-65mm', 2),
(UUID_TO_BIN(UUID()), 'CC-019', 'Xe đẩy đồ nghề 3 tầng có ngăn kéo', 6),
(UUID_TO_BIN(UUID()), 'CC-020', 'Thang nhôm chữ A cao 3 mét', 8);

-- Kết thúc script
