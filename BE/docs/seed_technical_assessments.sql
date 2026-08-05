-- =====================================================================
-- Seed 10 biên bản đánh giá kỹ thuật mẫu (technical_assessment)
-- Dùng equipment_id / employee_id có sẵn trong DB scms_db
-- Số biên bản theo format của TechnicalAssessmentService: BBKT-yy-MM-dd-NNNN
-- Chạy: docker exec -i scms_mysql_db mysql -uroot -p1234 scms_db < seed_technical_assessments.sql
-- =====================================================================

SET NAMES utf8mb4;

INSERT INTO technical_assessment
    (assessment_id, assessment_number, equipment_id, damage_description, proposed_action,
     repair_signed_by, repair_signed_at, operation_signed_by, operation_signed_at,
     pdf_url, created_by, created_at, is_deleted)
VALUES
-- 1. Bơm nước thô RW-P01 – đã ký đủ 2 bên
(UNHEX('40000000000000000000000000000001'), 'BBKT-26-06-02-0001',
 UNHEX('30000000000000000001000000000001'),
 'Bơm nước thô đầu vào RW-P01 phát sinh tiếng kêu bất thường và rung vượt ngưỡng cho phép (đo được 7,8 mm/s so với giới hạn 4,5 mm/s) tại gối đỡ phía khớp nối. Nhiệt độ vỏ ổ bi tăng lên 78°C sau 2 giờ vận hành liên tục. Kiểm tra sơ bộ phát hiện dầu bôi trơn bị nhiễm nước, ngả màu đục, mức dầu tụt dưới vạch MIN. Lưu lượng đầu ra giảm khoảng 12% so với thông số thiết kế.',
 'Dừng bơm, cô lập điện và chuyển sang vận hành bơm dự phòng RW-P02. Tháo gối đỡ kiểm tra, thay thế bộ vòng bi SKF 6312 C3 hai phía, thay phớt chặn dầu và toàn bộ dầu bôi trơn ISO VG 46. Cân chỉnh lại đồng tâm khớp nối bằng đồng hồ so, dung sai cho phép 0,05 mm. Sau lắp đặt chạy thử không tải 30 phút, đo lại độ rung và nhiệt độ trước khi bàn giao vận hành.',
 UNHEX('10000000000000000000000000000008'), '2026-06-02 15:40:00',
 UNHEX('10000000000000000000000000000005'), '2026-06-02 16:25:00',
 'https://res.cloudinary.com/demo/image/upload/scms/assessments/bbkt-26-06-02-0001.pdf',
 UNHEX('12000000000000000000000000000013'), '2026-06-02 08:15:00', 0),

-- 2. Động cơ điện bơm nước thô RW-M01 – đã ký đủ 2 bên
(UNHEX('40000000000000000000000000000002'), 'BBKT-26-06-11-0001',
 UNHEX('30000000000000000001000000000005'),
 'Động cơ điện bơm nước thô RW-M01 bị nhảy aptomat bảo vệ quá tải 3 lần trong ca đêm ngày 10/06/2026. Đo điện trở cách điện cuộn dây stator bằng Megohm 500V chỉ đạt 0,8 MΩ (tiêu chuẩn tối thiểu 5 MΩ). Dòng điện 3 pha mất cân bằng: pha A 42A, pha B 47A, pha C 39A. Quạt làm mát phía đuôi động cơ bám nhiều bụi bẩn, cánh quạt nứt một vị trí.',
 'Cô lập nguồn, treo biển cảnh báo và tiến hành sấy cuộn dây stator ở nhiệt độ 70-80°C trong 12 giờ, đo lại điện trở cách điện sau mỗi 4 giờ. Vệ sinh toàn bộ khoang động cơ bằng khí nén khô, thay cánh quạt làm mát và lưới che. Nếu sau khi sấy điện trở cách điện vẫn dưới 5 MΩ thì lập phương án quấn lại cuộn dây stator. Kiểm tra siết lại toàn bộ đầu cốt tại hộp đấu dây và tủ điện cấp nguồn.',
 UNHEX('10000000000000000000000000000007'), '2026-06-11 17:10:00',
 UNHEX('10000000000000000000000000000006'), '2026-06-11 17:45:00',
 'https://res.cloudinary.com/demo/image/upload/scms/assessments/bbkt-26-06-11-0001.pdf',
 UNHEX('12000000000000000000000000000017'), '2026-06-11 09:30:00', 0),

-- 3. Bể lọc cát áp lực thô RW-F01 – chờ ký
(UNHEX('40000000000000000000000000000003'), 'BBKT-26-06-19-0001',
 UNHEX('30000000000000000001000000000004'),
 'Bể lọc cát áp lực thô RW-F01 có chênh áp qua lớp vật liệu lọc tăng nhanh bất thường, đạt 1,6 bar chỉ sau 6 giờ vận hành (chu kỳ thiết kế là 24 giờ). Nước sau lọc có độ đục 4,2 NTU, vượt ngưỡng cho phép 2 NTU. Quan sát trong quá trình rửa ngược thấy cát lọc trào ra theo đường xả, ước tính thất thoát khoảng 15% khối lượng vật liệu. Van rửa ngược DN200 đóng không kín, rò rỉ qua gioăng.',
 'Xả cạn bể, mở nắp kiểm tra và đánh giá chiều dày còn lại của lớp cát thạch anh và lớp sỏi đỡ. Bổ sung cát lọc thạch anh cỡ hạt 0,8-1,2 mm đạt lại chiều dày thiết kế 800 mm, san phẳng bề mặt. Kiểm tra và thay thế các chụp lọc bị vỡ ở sàn phân phối. Thay gioăng và rà lại bề mặt làm kín van rửa ngược DN200. Sau khi hoàn thành, chạy rửa ngược 3 chu kỳ và lấy mẫu kiểm tra độ đục đầu ra.',
 NULL, NULL, NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000022'), '2026-06-19 10:05:00', 0),

-- 4. Tháp trao đổi Cation DW-C01 – chỉ bên sửa chữa ký
(UNHEX('40000000000000000000000000000004'), 'BBKT-26-06-25-0001',
 UNHEX('30000000000000000002000000000001'),
 'Tháp trao đổi Cation DW-C01 suy giảm dung lượng trao đổi rõ rệt, chu kỳ làm việc giữa hai lần tái sinh rút ngắn từ 20 giờ xuống còn 11 giờ. Độ cứng nước đầu ra tăng lên 0,15 mgđl/l trong khi yêu cầu nhỏ hơn 0,02 mgđl/l. Kiểm tra qua kính quan sát thấy lớp hạt nhựa có hiện tượng vón cục, đổi màu nâu sẫm và lẫn nhiều mảnh vỡ. Nghi ngờ nhựa bị nhiễm sắt và lão hóa sau hơn 5 năm sử dụng.',
 'Lấy mẫu hạt nhựa gửi phân tích chỉ tiêu dung lượng trao đổi toàn phần và hàm lượng sắt bám. Thực hiện tái sinh tăng cường bằng dung dịch HCl 5% kết hợp rửa ngược kéo dài để loại bỏ mảnh vỡ và cặn bẩn. Nếu kết quả phân tích cho thấy dung lượng còn lại dưới 70% so với nhựa mới thì lập kế hoạch thay thế toàn bộ khối lượng 2,5 m³ hạt nhựa Cation trong đợt đại tu gần nhất. Đồng thời kiểm tra hệ thống phân phối nước phía trên và sàn chụp lọc phía dưới.',
 UNHEX('10000000000000000000000000000008'), '2026-06-25 16:00:00',
 NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000026'), '2026-06-25 11:20:00', 0),

-- 5. Bơm nước khử khoáng Demin DW-P01 – chờ ký
(UNHEX('40000000000000000000000000000005'), 'BBKT-26-07-03-0001',
 UNHEX('30000000000000000002000000000004'),
 'Bơm nước khử khoáng Demin DW-P01 rò rỉ nước liên tục tại vị trí phớt cơ khí, lưu lượng rò ước tính 25 lít/giờ chảy xuống bệ móng gây đọng nước và ăn mòn chân đế. Áp suất đẩy dao động mạnh trong khoảng 5,2-7,8 bar thay vì ổn định ở 8 bar. Khi khởi động có hiện tượng giật cục, đồng hồ áp lực đầu hút chỉ giá trị âm bất thường cho thấy khả năng lọt khí vào đường ống hút.',
 'Cô lập bơm khỏi hệ thống, xả áp và tháo cụm phớt cơ khí để kiểm tra. Thay thế phớt cơ khí John Crane Type 21 cùng bộ gioăng làm kín thân bơm. Kiểm tra độ mòn và độ đảo của trục bơm tại vị trí lắp phớt, nếu vượt 0,05 mm thì phục hồi bằng phương pháp phun phủ hoặc thay trục. Rà soát toàn bộ mặt bích và van một chiều trên đường ống hút để xử lý điểm lọt khí. Vệ sinh, sơn chống ăn mòn lại bệ móng bơm sau khi hoàn tất.',
 NULL, NULL, NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000029'), '2026-07-03 08:45:00', 0),

-- 6. Cảm biến độ dẫn điện nước Demin – đã ký đủ 2 bên
(UNHEX('40000000000000000000000000000006'), 'BBKT-26-07-09-0001',
 UNHEX('30000000000000000002000000000005'),
 'Cảm biến độ dẫn điện nước Demin DW-QI01 cho tín hiệu sai lệch nghiêm trọng so với kết quả đo bằng thiết bị cầm tay đã hiệu chuẩn. Giá trị hiển thị trên DCS là 0,08 µS/cm trong khi đo thực tế tại chỗ là 0,35 µS/cm. Tín hiệu 4-20mA về DCS bị nhiễu, giá trị nhảy loạn không theo quy luật. Kiểm tra hiện trường phát hiện đầu điện cực bám lớp cặn trắng và cáp tín hiệu bị bong lớp vỏ chống nhiễu tại đoạn đi qua máng cáp.',
 'Tháo đầu đo, vệ sinh điện cực bằng dung dịch axit loãng theo hướng dẫn nhà sản xuất rồi tráng lại bằng nước khử khoáng. Hiệu chuẩn lại cảm biến bằng dung dịch chuẩn 1,3 µS/cm và 12,88 µS/cm, lập biên bản hiệu chuẩn kèm theo. Thay đoạn cáp tín hiệu bị hư hỏng bằng cáp có vỏ bọc chống nhiễu, đấu tiếp địa màn chắn về một điểm duy nhất tại tủ điều khiển. Kiểm tra lại thang đo và cảnh báo cấu hình trên DCS sau khi khắc phục.',
 UNHEX('10000000000000000000000000000008'), '2026-07-09 14:30:00',
 UNHEX('10000000000000000000000000000006'), '2026-07-09 15:05:00',
 'https://res.cloudinary.com/demo/image/upload/scms/assessments/bbkt-26-07-09-0001.pdf',
 UNHEX('12000000000000000000000000000031'), '2026-07-09 09:00:00', 0),

-- 7. Đèn tiệt trùng UV PW-UV01 – chờ ký
(UNHEX('40000000000000000000000000000007'), 'BBKT-26-07-16-0001',
 UNHEX('30000000000000000003000000000003'),
 'Hệ thống đèn tiệt trùng tia cực tím PW-UV01 báo lỗi cường độ bức xạ thấp trên tủ điều khiển, giá trị đo được chỉ đạt 42% so với định mức. Trong tổng số 6 bóng UV có 2 bóng không sáng, 1 bóng sáng chập chờn. Ống thạch anh bảo vệ bám cặn canxi dày, giảm khả năng truyền tia. Tổng giờ vận hành tích lũy của bộ bóng đã đạt 11.500 giờ, vượt khuyến cáo thay thế của nhà sản xuất là 9.000 giờ.',
 'Cô lập cụm UV, xả cạn và tháo toàn bộ 6 bóng đèn cùng ống thạch anh. Thay mới toàn bộ bộ bóng UV theo đúng chủng loại và công suất thiết kế, không thay lẻ để đảm bảo đồng đều cường độ bức xạ. Vệ sinh ống thạch anh bằng dung dịch axit citric 5%, thay thế các ống bị rạn nứt. Thay gioăng O-ring làm kín và kiểm tra thử kín ở áp suất làm việc. Reset bộ đếm giờ vận hành và hiệu chuẩn lại cảm biến cường độ UV sau khi lắp đặt.',
 NULL, NULL, NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000034'), '2026-07-16 13:25:00', 0),

-- 8. Bơm định lượng Clo PW-P02 – chỉ bên vận hành ký
(UNHEX('40000000000000000000000000000008'), 'BBKT-26-07-22-0001',
 UNHEX('30000000000000000003000000000004'),
 'Bơm định lượng Clo tiệt trùng PW-P02 hoạt động không ổn định, lưu lượng châm thực tế chỉ đạt khoảng 60% so với giá trị cài đặt, dẫn đến hàm lượng Clo dư trong nước sinh hoạt dao động 0,15-0,25 mg/l, thấp hơn ngưỡng quy định 0,3-0,5 mg/l. Phát hiện màng bơm bị phồng và có vết rạn, van một chiều đầu hút đóng không kín làm dung dịch hồi ngược. Khu vực đặt bơm có mùi Clo nồng, nghi ngờ rò rỉ tại đầu nối ống dẫn.',
 'Trang bị đầy đủ bảo hộ chuyên dụng (mặt nạ phòng độc, găng tay chống hóa chất) trước khi thao tác. Cô lập bơm, xả và trung hòa dung dịch tồn trong đường ống. Thay màng bơm PTFE, bộ van một chiều đầu hút và đầu đẩy cùng toàn bộ gioăng làm kín. Thay đoạn ống dẫn PVC bị lão hóa và siết lại các đầu nối ren. Sau lắp đặt, hiệu chuẩn lại lưu lượng bơm bằng ống chuẩn định lượng ở 3 mức 30%, 60%, 100% và ghi nhận vào phiếu hiệu chuẩn.',
 NULL, NULL,
 UNHEX('10000000000000000000000000000005'), '2026-07-22 16:40:00',
 NULL,
 UNHEX('12000000000000000000000000000020'), '2026-07-22 10:50:00', 0),

-- 9. Máy ép bùn ly tâm TWW-BF01 – chờ ký
(UNHEX('40000000000000000000000000000009'), 'BBKT-26-07-30-0001',
 UNHEX('30000000000000000004000000000004'),
 'Máy ép bùn ly tâm TWW-BF01 rung lắc mạnh khi tăng tốc qua vùng 2.400 vòng/phút, biên độ rung đo tại thân máy đạt 11,2 mm/s vượt xa mức cho phép 6,3 mm/s. Bánh vít tải bùn có dấu hiệu mài mòn không đều ở phần côn, khe hở giữa vít tải và thành bát ly tâm tăng lên 3,5 mm so với thiết kế 1,5 mm. Độ khô bánh bùn đầu ra giảm từ 22% xuống còn 15%, làm tăng khối lượng bùn phải vận chuyển xử lý.',
 'Dừng máy, cô lập nguồn điện và khóa cấp bùn đầu vào. Tháo cụm rotor để kiểm tra tổng thể, đo lại khe hở vít tải và độ mòn lớp phủ chống mài mòn tại các cánh vít. Hàn đắp phục hồi lớp hợp kim cứng tại các cánh vít bị mòn, gia công lại theo biên dạng gốc. Cân bằng động cụm rotor trên máy chuyên dụng đạt cấp G2.5. Thay bộ vòng bi hai đầu trục và dầu hộp giảm tốc. Chạy thử theo từng cấp tốc độ và đo rung xác nhận đạt yêu cầu trước khi đưa vào vận hành.',
 NULL, NULL, NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000024'), '2026-07-30 14:10:00', 0),

-- 10. Bơm nước thải chìm TWW-P01 – chờ ký
(UNHEX('40000000000000000000000000000010'), 'BBKT-26-08-04-0001',
 UNHEX('30000000000000000004000000000002'),
 'Bơm nước thải chìm TWW-P01 tự động dừng do rơ le bảo vệ chạm đất tác động trong ca sáng ngày 04/08/2026. Đo điện trở cách điện cuộn dây bằng Megohm 500V chỉ còn 0,2 MΩ, cảm biến phát hiện nước trong khoang dầu đã báo động. Khi kéo bơm lên kiểm tra thấy cáp điện chìm bị trầy xước lớp vỏ tại vị trí tiếp xúc thành hố, cánh bơm quấn nhiều rác sợi và giẻ lau, mặt bích xả bám cặn dày làm giảm tiết diện thoát nước.',
 'Đưa bơm lên mặt bằng, vệ sinh toàn bộ phần ngập nước bằng nước áp lực cao và gỡ sạch rác quấn ở cánh bơm. Thay cáp điện chìm bằng loại chuyên dụng chống thấm cùng chủng loại, bọc ống bảo vệ tại đoạn tiếp xúc thành hố. Tháo khoang dầu, xả nước lẫn và thay phớt cơ khí kép cùng dầu bôi trơn mới. Sấy cuộn dây và đo lại điện trở cách điện, chỉ đưa vào vận hành khi đạt tối thiểu 5 MΩ. Kiến nghị lắp bổ sung song chắn rác thô tại đầu hố bơm để hạn chế tái diễn sự cố quấn rác.',
 NULL, NULL, NULL, NULL, NULL,
 UNHEX('12000000000000000000000000000037'), '2026-08-04 09:35:00', 0);
