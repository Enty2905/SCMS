-- ============================================================================
-- SCMS - Du lieu mau HR thuc te
-- Muc tieu sau khi chay tren bo du lieu mac dinh:
--   - 50 nhan vien dang lam viec
--   - 20 tai khoan hoat dong (11 co san + 9 bo sung)
-- Script chi bo sung/cap nhat cac ban ghi co ma NV013 den NV050, khong xoa du lieu.
-- ============================================================================

SET NAMES utf8mb4;
USE scms_db;

SET @dept_bgd  = (SELECT department_id FROM department WHERE department_code = 'BGD'  AND is_deleted = 0 LIMIT 1);
SET @dept_ns   = (SELECT department_id FROM department WHERE department_code = 'NS'   AND is_deleted = 0 LIMIT 1);
SET @dept_khvt = (SELECT department_id FROM department WHERE department_code = 'KHVT' AND is_deleted = 0 LIMIT 1);
SET @dept_pxvh = (SELECT department_id FROM department WHERE department_code = 'PXVH' AND is_deleted = 0 LIMIT 1);
SET @dept_pxsc = (SELECT department_id FROM department WHERE department_code = 'PXSC' AND is_deleted = 0 LIMIT 1);

SET @pos_head      = (SELECT position_id FROM employee_position WHERE position_name = 'Trưởng phòng' AND is_deleted = 0 LIMIT 1);
SET @pos_hr        = (SELECT position_id FROM employee_position WHERE position_name = 'Nhân viên nhân sự' AND is_deleted = 0 LIMIT 1);
SET @pos_warehouse = (SELECT position_id FROM employee_position WHERE position_name = 'Thủ kho' AND is_deleted = 0 LIMIT 1);
SET @pos_shift     = (SELECT position_id FROM employee_position WHERE position_name = 'Trưởng ca' AND is_deleted = 0 LIMIT 1);
SET @pos_team      = (SELECT position_id FROM employee_position WHERE position_name = 'Tổ trưởng sửa chữa' AND is_deleted = 0 LIMIT 1);
SET @pos_tech      = (SELECT position_id FROM employee_position WHERE position_name = 'Kỹ thuật viên' AND is_deleted = 0 LIMIT 1);

START TRANSACTION;

-- Hoàn thiện bản ghi quản trị viên cũ để không còn nhân sự chưa gán đơn vị.
UPDATE employee e
JOIN `user` u ON u.employee_id = e.employee_id
SET e.department_id = @dept_bgd,
    e.work_location = 'Tòa nhà điều hành - Phòng hệ thống',
    e.status = 'Đang làm việc'
WHERE u.username = 'admin'
  AND e.department_id IS NULL;

INSERT INTO employee
    (employee_id, employee_code, name, phone, email, avatar_url,
     department_id, position_id, work_location, gender, status,
     is_deleted, deleted_at)
VALUES
-- Ban giám đốc: tổng cộng 3 nhân sự sau khi bổ sung.
(UUID_TO_BIN('12000000-0000-0000-0000-000000000013'), 'NV013', 'Lê Quốc Bảo', '0912000013', 'lequocbao@nhm.vn', NULL, @dept_bgd, @pos_head, 'Tòa nhà điều hành - Tầng 3', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000014'), 'NV014', 'Trần Ngọc Mai', '0912000014', 'tranngocmai@nhm.vn', NULL, @dept_bgd, @pos_tech, 'Tòa nhà điều hành - Tầng 3', 'Nữ', 'Đang làm việc', 0, NULL),

-- Phòng nhân sự: tổng cộng 8 nhân sự sau khi bổ sung.
(UUID_TO_BIN('12000000-0000-0000-0000-000000000015'), 'NV015', 'Phạm Thu Trang', '0912000015', 'phamthutrang@nhm.vn', NULL, @dept_ns, @pos_head, 'Tòa nhà điều hành - Tầng 2', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000016'), 'NV016', 'Võ Minh Anh', '0912000016', 'vominhanh@nhm.vn', NULL, @dept_ns, @pos_hr, 'Tòa nhà điều hành - Tầng 2', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000017'), 'NV017', 'Đặng Hoài Nam', '0912000017', 'danghoainam@nhm.vn', NULL, @dept_ns, @pos_hr, 'Tòa nhà điều hành - Tầng 2', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000018'), 'NV018', 'Nguyễn Khánh Linh', '0912000018', 'nguyenkhanhlinh@nhm.vn', NULL, @dept_ns, @pos_hr, 'Tòa nhà điều hành - Tầng 2', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000019'), 'NV019', 'Bùi Gia Hân', '0912000019', 'buigiahan@nhm.vn', NULL, @dept_ns, @pos_hr, 'Tòa nhà điều hành - Tầng 2', 'Nữ', 'Đang làm việc', 0, NULL),

-- Phòng kế hoạch vật tư: tổng cộng 10 nhân sự sau khi bổ sung.
(UUID_TO_BIN('12000000-0000-0000-0000-000000000020'), 'NV020', 'Nguyễn Văn Phúc', '0912000020', 'nguyenvanphuc@nhm.vn', NULL, @dept_khvt, @pos_warehouse, 'Kho vật tư trung tâm', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000021'), 'NV021', 'Trương Thị Hồng', '0912000021', 'truongthihong@nhm.vn', NULL, @dept_khvt, @pos_warehouse, 'Kho công cụ dụng cụ', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000022'), 'NV022', 'Lê Minh Khoa', '0912000022', 'leminhkhoa@nhm.vn', NULL, @dept_khvt, @pos_warehouse, 'Kho vật tư trung tâm', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000023'), 'NV023', 'Phan Ngọc Diệp', '0912000023', 'phanngocdiep@nhm.vn', NULL, @dept_khvt, @pos_warehouse, 'Kho công cụ dụng cụ', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000024'), 'NV024', 'Đỗ Anh Tuấn', '0912000024', 'doanhtuan@nhm.vn', NULL, @dept_khvt, @pos_head, 'Tòa nhà điều hành - Tầng 1', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000025'), 'NV025', 'Vũ Thị Thanh', '0912000025', 'vuthithanh@nhm.vn', NULL, @dept_khvt, @pos_tech, 'Tòa nhà điều hành - Tầng 1', 'Nữ', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000026'), 'NV026', 'Huỳnh Quốc Huy', '0912000026', 'huynhquochuy@nhm.vn', NULL, @dept_khvt, @pos_tech, 'Kho vật tư trung tâm', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000027'), 'NV027', 'Mai Đức Thịnh', '0912000027', 'maiducthinh@nhm.vn', NULL, @dept_khvt, @pos_tech, 'Kho vật tư trung tâm', 'Nam', 'Đang làm việc', 0, NULL),

-- Phân xưởng vận hành: tổng cộng 16 nhân sự sau khi bổ sung.
(UUID_TO_BIN('12000000-0000-0000-0000-000000000028'), 'NV028', 'Nguyễn Quốc Cường', '0912000028', 'nguyenquoccuong@nhm.vn', NULL, @dept_pxvh, @pos_shift, 'Phòng điều khiển trung tâm', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000029'), 'NV029', 'Trần Đức Thành', '0912000029', 'tranducthanh@nhm.vn', NULL, @dept_pxvh, @pos_shift, 'Phòng điều khiển trung tâm', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000030'), 'NV030', 'Phạm Văn Sơn', '0912000030', 'phamvanson@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực lò hơi - Tổ máy 1', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000031'), 'NV031', 'Lê Hoàng Anh', '0912000031', 'lehoanganh@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực tua-bin - Tổ máy 1', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000032'), 'NV032', 'Võ Tuấn Kiệt', '0912000032', 'votuankiet@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực máy phát - Tổ máy 1', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000033'), 'NV033', 'Đặng Minh Quân', '0912000033', 'dangminhquan@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực lò hơi - Tổ máy 2', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000034'), 'NV034', 'Bùi Thanh Tùng', '0912000034', 'buithanhtung@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực tua-bin - Tổ máy 2', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000035'), 'NV035', 'Đỗ Thành Công', '0912000035', 'dothanhcong@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Khu vực máy phát - Tổ máy 2', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000036'), 'NV036', 'Hồ Gia Bảo', '0912000036', 'hogiabao@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Trạm điện và sân phân phối', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000037'), 'NV037', 'Dương Văn Hùng', '0912000037', 'duongvanhung@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Hệ thống xử lý nước', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000038'), 'NV038', 'Trịnh Quang Khải', '0912000038', 'trinhquangkhai@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Hệ thống nhiên liệu', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000039'), 'NV039', 'Nguyễn Hải Đăng', '0912000039', 'nguyenhaidang@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Hệ thống khí nén', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000040'), 'NV040', 'Phan Công Minh', '0912000040', 'phancongminh@nhm.vn', NULL, @dept_pxvh, @pos_tech, 'Hệ thống thải tro xỉ', 'Nam', 'Đang làm việc', 0, NULL),

-- Phân xưởng sửa chữa: tổng cộng 12 nhân sự sau khi bổ sung.
(UUID_TO_BIN('12000000-0000-0000-0000-000000000041'), 'NV041', 'Trần Hữu Nghĩa', '0912000041', 'tranhuunghia@nhm.vn', NULL, @dept_pxsc, @pos_team, 'Nhà xưởng sửa chữa cơ khí', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000042'), 'NV042', 'Lê Văn Bình', '0912000042', 'levanbinh@nhm.vn', NULL, @dept_pxsc, @pos_team, 'Nhà xưởng sửa chữa điện', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000043'), 'NV043', 'Nguyễn Duy Khánh', '0912000043', 'nguyenduykhanh@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ cơ khí quay', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000044'), 'NV044', 'Phạm Quốc Việt', '0912000044', 'phamquocviet@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ sửa chữa điện', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000045'), 'NV045', 'Võ Đức Mạnh', '0912000045', 'voducmanh@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ đo lường điều khiển', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000046'), 'NV046', 'Đặng Trung Hiếu', '0912000046', 'dangtrunghieu@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ sửa chữa tua-bin', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000047'), 'NV047', 'Bùi Xuân Trường', '0912000047', 'buixuantruong@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ sửa chữa lò hơi', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000048'), 'NV048', 'Đỗ Minh Nhật', '0912000048', 'dominhnhat@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ hàn và gia công', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000049'), 'NV049', 'Hoàng Anh Dũng', '0912000049', 'hoanganhdung@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ sửa chữa thiết bị phụ', 'Nam', 'Đang làm việc', 0, NULL),
(UUID_TO_BIN('12000000-0000-0000-0000-000000000050'), 'NV050', 'Trương Thành Đạt', '0912000050', 'truongthanhdat@nhm.vn', NULL, @dept_pxsc, @pos_tech, 'Tổ bảo dưỡng tổng hợp', 'Nam', 'Đang làm việc', 0, NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    phone = VALUES(phone),
    email = VALUES(email),
    department_id = VALUES(department_id),
    position_id = VALUES(position_id),
    work_location = VALUES(work_location),
    gender = VALUES(gender),
    status = VALUES(status),
    is_deleted = 0,
    deleted_at = NULL;

-- Dùng cùng mật khẩu demo "password" với tài khoản admin hiện tại.
SET @demo_password_hash = (SELECT password_hash FROM `user` WHERE username = 'admin' LIMIT 1);

INSERT INTO `user`
    (user_id, username, password_hash, employee_id,
     is_active, is_deleted, deleted_at, created_at)
VALUES
(UUID_TO_BIN('22000000-0000-0000-0000-000000000013'), 'executive_office', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000013'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000015'), 'hr_lead', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000015'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000020'), 'warehouse_mat_2', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000020'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000021'), 'warehouse_tool_2', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000021'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000028'), 'shift_leader_2', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000028'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000030'), 'operator_01', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000030'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000041'), 'team_leader_2', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000041'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000043'), 'repair_tech_01', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000043'), 1, 0, NULL, NOW()),
(UUID_TO_BIN('22000000-0000-0000-0000-000000000044'), 'repair_tech_02', @demo_password_hash, UUID_TO_BIN('12000000-0000-0000-0000-000000000044'), 1, 0, NULL, NOW())
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    employee_id = VALUES(employee_id),
    is_active = 1,
    is_deleted = 0,
    deleted_at = NULL;

SET @role_admin_user     = (SELECT role_id FROM role WHERE role_code = 'USER' AND is_deleted = 0 LIMIT 1);
SET @role_hr             = (SELECT role_id FROM role WHERE role_code = 'HR' AND is_deleted = 0 LIMIT 1);
SET @role_warehouse_mat  = (SELECT role_id FROM role WHERE role_code = 'WAREHOUSE_MAT' AND is_deleted = 0 LIMIT 1);
SET @role_warehouse_tool = (SELECT role_id FROM role WHERE role_code = 'WAREHOUSE_TOOL' AND is_deleted = 0 LIMIT 1);
SET @role_shift_leader   = (SELECT role_id FROM role WHERE role_code = 'SHIFT_LEADER' AND is_deleted = 0 LIMIT 1);
SET @role_team_leader    = (SELECT role_id FROM role WHERE role_code = 'TEAM_LEADER' AND is_deleted = 0 LIMIT 1);

INSERT INTO employee_role (id, employee_id, role_id, assigned_at)
VALUES
(UUID_TO_BIN('32000000-0000-0000-0000-000000000013'), UUID_TO_BIN('12000000-0000-0000-0000-000000000013'), @role_admin_user, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000015'), UUID_TO_BIN('12000000-0000-0000-0000-000000000015'), @role_hr, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000020'), UUID_TO_BIN('12000000-0000-0000-0000-000000000020'), @role_warehouse_mat, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000021'), UUID_TO_BIN('12000000-0000-0000-0000-000000000021'), @role_warehouse_tool, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000028'), UUID_TO_BIN('12000000-0000-0000-0000-000000000028'), @role_shift_leader, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000030'), UUID_TO_BIN('12000000-0000-0000-0000-000000000030'), @role_admin_user, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000041'), UUID_TO_BIN('12000000-0000-0000-0000-000000000041'), @role_team_leader, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000043'), UUID_TO_BIN('12000000-0000-0000-0000-000000000043'), @role_admin_user, NOW()),
(UUID_TO_BIN('32000000-0000-0000-0000-000000000044'), UUID_TO_BIN('12000000-0000-0000-0000-000000000044'), @role_admin_user, NOW())
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id);

COMMIT;

-- Kiem tra ket qua.
SELECT COUNT(*) AS active_employee_count
FROM employee
WHERE is_deleted = 0;

SELECT COUNT(*) AS active_account_count
FROM `user`
WHERE is_active = 1 AND is_deleted = 0;

SELECT
    COALESCE(d.department_code, 'CHUA_GAN') AS department_code,
    COALESCE(d.department_name, 'Chưa gán phòng ban') AS department_name,
    COUNT(*) AS employee_count,
    SUM(CASE WHEN u.user_id IS NOT NULL AND u.is_active = 1 AND u.is_deleted = 0 THEN 1 ELSE 0 END) AS account_count
FROM employee e
LEFT JOIN department d ON d.department_id = e.department_id
LEFT JOIN `user` u ON u.employee_id = e.employee_id
WHERE e.is_deleted = 0
GROUP BY d.department_id, d.department_code, d.department_name
ORDER BY department_code;
