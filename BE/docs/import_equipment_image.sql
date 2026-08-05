-- =====================================================================
-- Import anh thiet bi (equipment_image) tu ban dump phpMyAdmin
-- Nguon: equipment_image.sql (04/08/2026)
--
-- Da hieu chinh so voi ban dump goc:
--   1. Bo CREATE TABLE  -> bang da ton tai, schema hien tai la ban tot hon
--      (image_url varchar(500) thay vi 255, co them FK fk_image_user)
--   2. Bo cot `public_id` -> khong co trong DB va trong entity EquipmentImage.
--      Toan bo gia tri trong dump deu NULL nen bo di khong mat du lieu.
--   3. Bo cac lenh ALTER TABLE (PRIMARY KEY / INDEX / FOREIGN KEY)
--      -> deu da ton tai san trong bang.
--   4. Bo 2 dong trung khoa chinh 35...0002 va 35...0005:
--      ban trong dump tro toi file localhost:8081 khong ton tai tren dia,
--      se ghi de len 2 anh unsplash dang hien thi binh thuong.
--
-- Ket qua: chen 18 dong anh Cloudinary. Khong xoa/sua du lieu cu.
-- Ghi chu: cot uploaded_at kieu TIMESTAMP (do chinh xac giay) nen
--          phan micro-giay trong dump se duoc lam tron.
-- =====================================================================

START TRANSACTION;

INSERT INTO `equipment_image`
    (`image_id`, `equipment_id`, `image_url`, `caption`, `uploaded_at`, `uploaded_by`)
VALUES
(0x068aacdb63174a3b9fdcef8f3c9decb5, 0x30000000000000000004000000000005, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857099/scms/equipment/pqcva5epzvasanzi0yxb.png', 'thai1.png',   '2026-08-04 22:24:56.379831', 0x20000000000000000000000000000005),
(0x0df559952b1b4f5cb2fd44f23875df77, 0x30000000000000000002000000000004, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856971/scms/equipment/r5rgfl7uhrzu8noro9ai.png', 'demin5.png',  '2026-08-04 22:22:49.409471', 0x20000000000000000000000000000005),
(0x0f9c88bdd66f4ec7907284607f9a5674, 0x30000000000000000001000000000002, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856710/scms/equipment/hpiobtnsj6hwovuznrpu.png', 'loctho1.png', '2026-08-04 22:18:28.524239', 0x20000000000000000000000000000005),
(0x14fed7fb665741eebe66ba60c5501b9c, 0x30000000000000000001000000000005, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856858/scms/equipment/puuybn8crpxo4dzyspcc.png', 'tho3.png',    '2026-08-04 22:20:56.292228', 0x20000000000000000000000000000005),
(0x1685643b851f4fc1beb6c395b68f2b50, 0x30000000000000000004000000000002, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857055/scms/equipment/marpbkuj9icur5sczjnx.png', 'thai3.png',   '2026-08-04 22:24:12.809468', 0x20000000000000000000000000000005),
(0x228be23b852449f4a84af8cfccb9aacf, 0x30000000000000000001000000000003, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856774/scms/equipment/joo5t1uydt1hmvsfjlfr.png', 'tho4.png',    '2026-08-04 22:19:32.464004', 0x20000000000000000000000000000005),
(0x27b736751aad49feaeb0b3a482151484, 0x30000000000000000002000000000001, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856931/scms/equipment/pslzzeqmbdfkjbj2uq1s.png', 'demin6.png',  '2026-08-04 22:22:08.933430', 0x20000000000000000000000000000005),
(0x27f4f96fefad4fc58c8ce97969605e68, 0x30000000000000000001000000000004, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856837/scms/equipment/zjgx9o0kkwbm7sfyv9jk.png', 'tho4.png',    '2026-08-04 22:20:35.342851', 0x20000000000000000000000000000005),
(0x28aa15fa42824ed88bf3af2ce870c08b, 0x30000000000000000004000000000003, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857067/scms/equipment/jqwuhjerwjxrx41o4b0w.png', 'thai4.png',   '2026-08-04 22:24:24.423963', 0x20000000000000000000000000000005),
(0x61564dd4888340679112db2a82f28c5c, 0x30000000000000000001000000000007, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856905/scms/equipment/ynggfj1wqzpwszfyl7ff.png', 'tho5.png',    '2026-08-04 22:21:43.010866', 0x20000000000000000000000000000005),
(0x720a684322d2426ba743c438bcb51b55, 0x30000000000000000002000000000006, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857013/scms/equipment/qmgg0dgjqhwlnhwfmk8t.png', 'demin5.png',  '2026-08-04 22:23:31.052736', 0x20000000000000000000000000000005),
(0x73f29a8992dd4e51930af1e298ba1821, 0x30000000000000000002000000000002, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856946/scms/equipment/i4bbf8vk0ewqsphukvx6.png', 'demin5.png',  '2026-08-04 22:22:23.366697', 0x20000000000000000000000000000005),
(0x747196ec242d46c5a3fbc9f51d3cb523, 0x30000000000000000001000000000001, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856582/scms/equipment/qkjvmo1cmg5ocdltabxf.png', 'thai10.png',  '2026-08-04 22:16:20.351782', 0x20000000000000000000000000000005),
(0x819da1053a244544bfc4ebcfe26372b1, 0x30000000000000000004000000000004, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857082/scms/equipment/rqajl4xf77r3j9apdvjh.png', 'thai2.png',   '2026-08-04 22:24:40.452495', 0x20000000000000000000000000000005),
(0xa1f7784da38f4daca5f0671fa69e4aa1, 0x30000000000000000002000000000003, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856958/scms/equipment/iic7nf9oxpsulyqpep5d.png', 'demin3.png',  '2026-08-04 22:22:35.974266', 0x20000000000000000000000000000005),
(0xd431330818b44abd86e82dfddff0d89b, 0x30000000000000000004000000000001, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785857042/scms/equipment/vfx1vy8tokyj7upec2by.png', 'thai1.png',   '2026-08-04 22:23:59.495621', 0x20000000000000000000000000000005),
(0xe0e78713a4a2461584ce2ee1343faba0, 0x30000000000000000001000000000006, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856881/scms/equipment/yjo81efeey0pknaahnsx.png', 'tho5.png',    '2026-08-04 22:21:19.365161', 0x20000000000000000000000000000005),
(0xf80b1dc4a4244bc689e3f46bb0ab235d, 0x30000000000000000002000000000005, 'https://res.cloudinary.com/dtayjf0fi/image/upload/v1785856998/scms/equipment/a1e53ejnclhwiplmyquz.png', 'demin6.png',  '2026-08-04 22:23:15.646520', 0x20000000000000000000000000000005);

COMMIT;
