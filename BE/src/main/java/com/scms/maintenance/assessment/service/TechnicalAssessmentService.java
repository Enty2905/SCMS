package com.scms.maintenance.assessment.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.common.pdf.PdfFontProvider;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.entity.EquipmentSystem;
import com.scms.equipment.repository.EquipmentRepository;
import com.scms.equipment.repository.EquipmentSystemRepository;
import com.scms.maintenance.assessment.dto.request.CreateAssessmentRequest;
import com.scms.maintenance.assessment.dto.response.AssessmentResponse;
import com.scms.maintenance.assessment.entity.TechnicalAssessment;
import com.scms.maintenance.assessment.repository.TechnicalAssessmentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.scms.common.service.CloudinaryService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicalAssessmentService {

        final TechnicalAssessmentRepository assessmentRepository;
        final EquipmentRepository equipmentRepository;
        final EmployeeRepository employeeRepository;
        final UserRepository userRepository;
        final CloudinaryService cloudinaryService;
        final EquipmentSystemRepository equipmentSystemRepository;

        @Value("${app.upload.pdf-dir}")
        String pdfUploadDir;

        @Value("${app.company.owner}")
        String companyOwner;

        @Value("${app.company.repair}")
        String companyRepair;

        @Value("${app.cloudinary-folder.assessments}")
        String assessmentCloudinaryFolder;

        // ── Chức năng 3A: Tạo biên bản ───────────────────────────────────────────

        /**
         * Tạo biên bản đánh giá kỹ thuật trên hệ thống
         *
         * @param req      dữ liệu tạo biên bản
         * @param username người đang đăng nhập
         */
        @Transactional
        public AssessmentResponse createAssessment(CreateAssessmentRequest req, String username) {

                // 1. Lấy equipment
                Equipment equipment = equipmentRepository.findById(req.getEquipmentId())
                                .orElseThrow(() -> new AppException(ErrorCode.EQUIPMENT_NOT_FOUND));

                // 2. Xác định employee tạo biên bản
                Employee createdBy;
                if (req.getCreatedByEmployeeId() != null) {
                        createdBy = employeeRepository.findById(req.getCreatedByEmployeeId())
                                        .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
                } else {
                        User currentUser = userRepository.findByUsernameWithDetails(username)
                                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                        createdBy = currentUser.getEmployee();
                }

                // 3. Tự sinh số biên bản đánh giá kỹ thuật (BB-DGKT-XXXX)
                String assessmentNumber = generateAssessmentNumber();

                // 4. Lưu biên bản
                TechnicalAssessment assessment = TechnicalAssessment.builder()
                                .assessmentNumber(assessmentNumber)
                                .equipment(equipment)
                                .damageDescription(req.getDamageDescription())
                                .proposedAction(req.getProposedAction())
                                .createdBy(createdBy)
                                .build();

                assessmentRepository.save(assessment);
                return toResponse(assessment);
        }

        // ── Xem chi tiết ─────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public AssessmentResponse getAssessmentById(UUID assessmentId) {
                TechnicalAssessment ta = assessmentRepository.findByIdWithDetails(assessmentId)
                                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
                return toResponse(ta);
        }

        // ── Chức năng 3B: Xuất PDF ────────────────────────────────────────────────

        /**
         * Generate file PDF biên bản đánh giá kỹ thuật (layout chính thức theo mẫu)
         */
        @Transactional(readOnly = true)
        public byte[] exportPdf(UUID assessmentId) {
                TechnicalAssessment ta = assessmentRepository.findByIdWithDetails(assessmentId)
                                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

                try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                        PdfWriter writer = new PdfWriter(baos);
                        PdfDocument pdf = new PdfDocument(writer);
                        Document document = new Document(pdf, PageSize.A4);
                        document.setMargins(30, 40, 30, 40);

                        PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
                        PdfFont normalFont = fonts.normal();
                        PdfFont boldFont = fonts.bold();

                        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

                        // ── Header Table ──────────────────────────────────────────────────
                        Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 22, 56, 22 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginBottom(10);

                        // Left Logo Cell
                        Cell leftLogoCell = new Cell()
                                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setPadding(5);
                        try {
                                Path path = Paths.get("src/main/resources/images/logo_left.png");
                                if (Files.exists(path)) {
                                        Image img = new Image(com.itextpdf.io.image.ImageDataFactory.create(path.toString()))
                                                        .setAutoScale(true);
                                        leftLogoCell.add(img);
                                } else {
                                        leftLogoCell.add(new Paragraph(companyOwner)
                                                        .setFont(boldFont)
                                                        .setFontSize(10)
                                                        .setFontColor(new DeviceRgb(0, 84, 166))
                                                        .setTextAlignment(TextAlignment.CENTER));
                                }
                        } catch (Exception e) {
                                leftLogoCell.add(new Paragraph(companyOwner).setFont(boldFont).setFontSize(10).setFontColor(new DeviceRgb(0, 84, 166)));
                        }

                        // Right Logo Cell
                        Cell rightLogoCell = new Cell()
                                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setPadding(5);
                        try {
                                Path path = Paths.get("src/main/resources/images/logo_right.png");
                                if (Files.exists(path)) {
                                        Image img = new Image(com.itextpdf.io.image.ImageDataFactory.create(path.toString()))
                                                        .setAutoScale(true);
                                        rightLogoCell.add(img);
                                } else {
                                        rightLogoCell.add(new Paragraph(companyRepair)
                                                        .setFont(boldFont)
                                                        .setFontSize(10)
                                                        .setFontColor(new DeviceRgb(0, 84, 166))
                                                        .setTextAlignment(TextAlignment.CENTER));
                                }
                        } catch (Exception e) {
                                rightLogoCell.add(new Paragraph(companyRepair).setFont(boldFont).setFontSize(10).setFontColor(new DeviceRgb(0, 84, 166)));
                        }

                        // Center Cell
                        Cell centerCell = new Cell()
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                                        .setPadding(5);
                        centerCell.add(new Paragraph("BIÊN BẢN ĐÁNH GIÁ KỸ THUẬT")
                                        .setFont(boldFont)
                                        .setFontSize(12)
                                        .setTextAlignment(TextAlignment.CENTER));
                        centerCell.add(new Paragraph("(Áp dụng cho các thiết bị khi có hư hỏng bất thường)")
                                        .setFont(normalFont)
                                        .setFontSize(9)
                                        .setItalic()
                                        .setTextAlignment(TextAlignment.CENTER));
                        String assessmentNum = ta.getAssessmentNumber() != null ? ta.getAssessmentNumber() : "....................";
                        centerCell.add(new Paragraph("Số: " + assessmentNum + "/ĐGKT")
                                        .setFont(normalFont)
                                        .setFontSize(10)
                                        .setTextAlignment(TextAlignment.CENTER));

                        headerTable.addCell(leftLogoCell);
                        headerTable.addCell(centerCell);
                        headerTable.addCell(rightLogoCell);

                        document.add(headerTable);

                        // ── Equipment & Info Table ──────────────────────────────────────
                        Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 20, 30, 20, 30 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginBottom(12);

                        Equipment eq = ta.getEquipment();
                        String equipmentName = eq != null ? eq.getEquipmentName() : "";
                        String kksCode = eq != null ? eq.getKksCode() : "";

                        // Fetch system name
                        String systemName = "";
                        if (eq != null && eq.getSystemId() != null) {
                                Optional<EquipmentSystem> systemOpt = equipmentSystemRepository.findById(eq.getSystemId());
                                if (systemOpt.isPresent()) {
                                        systemName = systemOpt.get().getSystemName();
                                }
                        }

                        // Row 1: Tên thiết bị (colspan 3)
                        infoTable.addCell(new Cell().add(new Paragraph("Tên thiết bị").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell(1, 3).add(new Paragraph(equipmentName).setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        // Row 2: Hệ thống (colspan 3)
                        infoTable.addCell(new Cell().add(new Paragraph("Hệ thống").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell(1, 3).add(new Paragraph(systemName).setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        // Row 3: Mã KKS & Số serial/Model
                        infoTable.addCell(new Cell().add(new Paragraph("Mã KKS").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph(kksCode).setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph("Số serial/Model").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph("").setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        // Row 4: Tên công việc (colspan 3)
                        infoTable.addCell(new Cell().add(new Paragraph("Tên công việc").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell(1, 3).add(new Paragraph("").setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        // Row 5: Người thực hiện (colspan 3) - Left blank for manual entry
                        infoTable.addCell(new Cell().add(new Paragraph("Người thực hiện").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell(1, 3).add(new Paragraph("").setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        // Row 6: Ngày bắt đầu
                        String startDate = ta.getCreatedAt() != null ? ta.getCreatedAt().format(df) : "";
                        infoTable.addCell(new Cell().add(new Paragraph("Ngày bắt đầu").setFont(boldFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph(startDate).setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph("").setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));
                        infoTable.addCell(new Cell().add(new Paragraph("").setFont(normalFont).setFontSize(10))
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1)).setPadding(5));

                        document.add(infoTable);

                        // ── Numbered Sections ──────────────────────────────────────────
                        // 1. Nội dung thực hiện
                        document.add(new Paragraph("1. Nội dung thực hiện")
                                        .setFont(boldFont)
                                        .setFontSize(11)
                                        .setMarginTop(6)
                                        .setMarginBottom(4));

                        String damageVal = ta.getDamageDescription();
                        if (damageVal != null && !damageVal.trim().isEmpty()) {
                                document.add(new Paragraph(damageVal)
                                                .setFont(normalFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(6));
                        } else {
                                for (int i = 0; i < 3; i++) {
                                        document.add(new Paragraph("........................................................................................................................................................")
                                                        .setFont(normalFont)
                                                        .setFontSize(10)
                                                        .setMarginLeft(15)
                                                        .setMarginBottom(2));
                                }
                        }

                        // 2. Kết quả:
                        document.add(new Paragraph("2. Kết quả:")
                                        .setFont(boldFont)
                                        .setFontSize(11)
                                        .setMarginTop(6)
                                        .setMarginBottom(4));
                        for (int i = 0; i < 2; i++) {
                                document.add(new Paragraph("........................................................................................................................................................")
                                                .setFont(normalFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(2));
                        }

                        Paragraph attachmentPara = new Paragraph()
                                        .setFont(normalFont)
                                        .setFontSize(9)
                                        .setMarginLeft(15)
                                        .setMarginTop(3)
                                        .setMarginBottom(6);
                        attachmentPara.add(new Text("Đính kèm:\n").setFont(boldFont).setItalic().setFontSize(9));
                        attachmentPara.add(new Text("☐ Biên bản đo đạc    ☐ Biên bản thử nghiệm    ☐ Hình ảnh    ☐ Bản vẽ    ☐ Khác       có .... trang;"));
                        document.add(attachmentPara);

                        // 3. Phân tích nguyên nhân:
                        document.add(new Paragraph("3. Phân tích nguyên nhân:")
                                        .setFont(boldFont)
                                        .setFontSize(11)
                                        .setMarginTop(6)
                                        .setMarginBottom(4));
                        for (int i = 0; i < 3; i++) {
                                document.add(new Paragraph("........................................................................................................................................................")
                                                .setFont(normalFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(2));
                        }

                        // 4. Biện pháp xử lý:
                        document.add(new Paragraph("4. Biện pháp xử lý:")
                                        .setFont(boldFont)
                                        .setFontSize(11)
                                        .setMarginTop(6)
                                        .setMarginBottom(4));

                        String actionVal = ta.getProposedAction();
                        if (actionVal != null && !actionVal.trim().isEmpty()) {
                                document.add(new Paragraph(actionVal)
                                                .setFont(normalFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(6));
                                
                                document.add(new Paragraph("4.3 Vật tư cần thiết:")
                                                .setFont(boldFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginTop(3)
                                                .setMarginBottom(3));
                                for (int i = 0; i < 2; i++) {
                                        document.add(new Paragraph(".................................................................................................................................................")
                                                        .setFont(normalFont)
                                                        .setFontSize(10)
                                                        .setMarginLeft(30)
                                                        .setMarginBottom(2));
                                }
                        } else {
                                document.add(new Paragraph("4.1 Phương án 1: triệt để")
                                                .setFont(boldFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(3));
                                for (int i = 0; i < 2; i++) {
                                        document.add(new Paragraph(".................................................................................................................................................")
                                                        .setFont(normalFont)
                                                        .setFontSize(10)
                                                        .setMarginLeft(30)
                                                        .setMarginBottom(2));
                                }

                                document.add(new Paragraph("4.2 Phương án 2: tạm thời")
                                                .setFont(boldFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginTop(3)
                                                .setMarginBottom(3));
                                for (int i = 0; i < 2; i++) {
                                        document.add(new Paragraph(".................................................................................................................................................")
                                                        .setFont(normalFont)
                                                        .setFontSize(10)
                                                        .setMarginLeft(30)
                                                        .setMarginBottom(2));
                                }

                                document.add(new Paragraph("4.3 Vật tư cần thiết:")
                                                .setFont(boldFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginTop(3)
                                                .setMarginBottom(3));
                                for (int i = 0; i < 2; i++) {
                                        document.add(new Paragraph(".................................................................................................................................................")
                                                        .setFont(normalFont)
                                                        .setFontSize(10)
                                                        .setMarginLeft(30)
                                                        .setMarginBottom(2));
                                }
                        }

                        // 5. Nhận xét và kiến nghị:
                        document.add(new Paragraph("5. Nhận xét và kiến nghị:")
                                        .setFont(boldFont)
                                        .setFontSize(11)
                                        .setMarginTop(6)
                                        .setMarginBottom(4));
                        for (int i = 0; i < 3; i++) {
                                document.add(new Paragraph("........................................................................................................................................................")
                                                .setFont(normalFont)
                                                .setFontSize(10)
                                                .setMarginLeft(15)
                                                .setMarginBottom(2));
                        }

                        // ── Signature Table ─────────────────────────────────────────────
                        Table signTable = new Table(UnitValue.createPercentArray(new float[] { 50, 50 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginTop(15)
                                        .setMarginBottom(10);

                        // Headers (light grey background)
                        Cell leftHeader = new Cell()
                                        .add(new Paragraph(companyOwner)
                                                        .setFont(boldFont)
                                                        .setFontSize(9)
                                                        .setTextAlignment(TextAlignment.CENTER))
                                        .setBackgroundColor(new DeviceRgb(220, 220, 220))
                                        .setPadding(6)
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1));

                        Cell rightHeader = new Cell()
                                        .add(new Paragraph(companyRepair)
                                                        .setFont(boldFont)
                                                        .setFontSize(9)
                                                        .setTextAlignment(TextAlignment.CENTER))
                                        .setBackgroundColor(new DeviceRgb(220, 220, 220))
                                        .setPadding(6)
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1));

                        signTable.addCell(leftHeader);
                        signTable.addCell(rightHeader);

                        // Content Cells
                        Cell leftContent = new Cell()
                                        .setPadding(8)
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1));
                        
                        // Block 1: Phân xưởng (Đơn vị QLTB)
                        leftContent.add(new Paragraph("Phân xưởng (Đơn vị QLTB)")
                                        .setFont(boldFont)
                                        .setFontSize(9)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(2));
                        if (ta.getOperationSignedBy() != null) {
                                leftContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                                .setFont(normalFont)
                                                .setFontSize(8)
                                                .setItalic()
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(30));
                                leftContent.add(new Paragraph(ta.getOperationSignedBy().getName())
                                                .setFont(boldFont)
                                                .setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(15));
                        } else {
                                leftContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                                .setFont(normalFont)
                                                .setFontSize(8)
                                                .setItalic()
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(55));
                        }

                        // Block 2: Phòng Kỹ thuật Công nghệ
                        leftContent.add(new Paragraph("Phòng Kỹ thuật Công nghệ")
                                        .setFont(boldFont)
                                        .setFontSize(9)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(2));
                        leftContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                        .setFont(normalFont)
                                        .setFontSize(8)
                                        .setItalic()
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(55));
                        
                        signTable.addCell(leftContent);

                        Cell rightContent = new Cell()
                                        .setPadding(8)
                                        .setBorder(new SolidBorder(ColorConstants.BLACK, 1));

                        // Block 1: Người kiểm tra
                        rightContent.add(new Paragraph("Người kiểm tra")
                                        .setFont(boldFont)
                                        .setFontSize(9)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(2));
                        if (ta.getRepairSignedBy() != null) {
                                rightContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                                .setFont(normalFont)
                                                .setFontSize(8)
                                                .setItalic()
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(30));
                                rightContent.add(new Paragraph(ta.getRepairSignedBy().getName())
                                                .setFont(boldFont)
                                                .setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(15));
                        } else {
                                rightContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                                .setFont(normalFont)
                                                .setFontSize(8)
                                                .setItalic()
                                                .setTextAlignment(TextAlignment.CENTER)
                                                .setMarginBottom(55));
                        }

                        // Block 2: Phân xưởng
                        rightContent.add(new Paragraph("Phân xưởng")
                                        .setFont(boldFont)
                                        .setFontSize(9)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(2));
                        rightContent.add(new Paragraph("(Ký và ghi rõ họ tên)")
                                        .setFont(normalFont)
                                        .setFontSize(8)
                                        .setItalic()
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(55));

                        signTable.addCell(rightContent);

                        document.add(signTable);

                        document.close();
                        return baos.toByteArray();

                } catch (IOException e) {
                        log.error("Lỗi khi generate PDF cho assessment {}", assessmentId, e);
                        throw new RuntimeException("Không thể xuất file PDF: " + e.getMessage(), e);
                }
        }

        // ── Chức năng 3C: Upload PDF đã ký ────────────────────────────────────────

        /**
         * Upload file PDF biên bản đã ký vật lý lên Cloudinary
         * Lưu URL vào database
         */
        @Transactional
        public AssessmentResponse uploadSignedPdf(UUID assessmentId, MultipartFile file) {

                TechnicalAssessment ta = assessmentRepository.findByIdWithDetails(assessmentId)
                                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

                // Validate file
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("File tải lên trống hoặc không hợp lệ!");
                }
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                        throw new IllegalArgumentException("Chỉ chấp nhận tệp định dạng PDF (.pdf)!");
                }

                try {
                        String pdfUrl = cloudinaryService.uploadFile(file, assessmentCloudinaryFolder);

                        // Cập nhật pdf_url vào DB
                        ta.setPdfUrl(pdfUrl);
                        ta.setRepairSignedAt(
                                        ta.getRepairSignedAt() != null ? ta.getRepairSignedAt() : LocalDateTime.now());

                        assessmentRepository.save(ta);
                        log.info("Uploaded signed PDF for assessment {} to Cloudinary: {}", assessmentId, pdfUrl);

                        return toResponse(ta);

                } catch (Exception e) {
                        log.error("Lỗi khi lưu file PDF cho assessment {}", assessmentId, e);
                        throw new IllegalArgumentException("Không thể lưu file PDF lên máy chủ: " + e.getMessage() + " (" + e.getClass().getSimpleName() + ")", e);
                }
        }

        // ── Lấy danh sách biên bản ────────────────────────────────────────────────
        @Transactional(readOnly = true)
        public List<AssessmentResponse> getAllAssessments() {
                return assessmentRepository.findAllWithDetails().stream()
                                .map(this::toResponse)
                                .toList();
        }

        // ── Tải PDF đã ký ────────────────────────────────────────────────────────
        @Transactional(readOnly = true)
        public byte[] downloadSignedPdf(UUID assessmentId) {
                TechnicalAssessment ta = assessmentRepository.findByIdWithDetails(assessmentId)
                                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

                if (ta.getPdfUrl() == null) {
                        throw new AppException(ErrorCode.NOT_FOUND);
                }

                if (ta.getPdfUrl().startsWith("http://") || ta.getPdfUrl().startsWith("https://")) {
                        try (java.io.InputStream in = new java.net.URL(ta.getPdfUrl()).openStream();
                             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                                byte[] buffer = new byte[4096];
                                int n;
                                while ((n = in.read(buffer)) != -1) {
                                        out.write(buffer, 0, n);
                                }
                                return out.toByteArray();
                        } catch (IOException e) {
                                log.error("Lỗi khi tải file PDF từ Cloudinary {}", ta.getPdfUrl(), e);
                                throw new RuntimeException("Không thể tải file PDF từ Cloudinary: " + e.getMessage(), e);
                        }
                } else {
                        try {
                                Path path = Paths.get(ta.getPdfUrl());
                                return Files.readAllBytes(path);
                        } catch (IOException e) {
                                log.error("Lỗi khi đọc file PDF đã ký {}", assessmentId, e);
                                throw new RuntimeException("Không thể đọc file PDF đã ký: " + e.getMessage(), e);
                        }
                }
        }

        // ── Mapping ──────────────────────────────────────────────────────────────

        private AssessmentResponse toResponse(TechnicalAssessment ta) {

                Equipment eq = ta.getEquipment();
                Employee creator = ta.getCreatedBy();
                Employee repairSigner = ta.getRepairSignedBy();
                Employee opSigner = ta.getOperationSignedBy();

                return AssessmentResponse.builder()
                                .assessmentId(ta.getAssessmentId())
                                .assessmentNumber(ta.getAssessmentNumber())
                                .damageDescription(ta.getDamageDescription())
                                .proposedAction(ta.getProposedAction())
                                .createdAt(ta.getCreatedAt())
                                .pdfUrl(ta.getPdfUrl())
                                .completionStatus(ta.getPdfUrl() != null ? "signed" : "draft")
                                // Equipment
                                .equipmentId(eq != null ? eq.getId() : null)
                                .equipmentKksCode(eq != null ? eq.getKksCode() : null)
                                .equipmentName(eq != null ? eq.getEquipmentName() : null)
                                .equipmentType(eq != null ? eq.getEquipmentType() : null)
                                .equipmentLocation(eq != null ? eq.getLocation() : null)
                                // Creator
                                .createdByEmployeeId(creator != null ? creator.getEmployeeId() : null)
                                .createdByName(creator != null ? creator.getName() : null)
                                .createdByPosition(creator != null && creator.getPosition() != null
                                                ? creator.getPosition().getPositionName()
                                                : null)
                                // Repair sign
                                .repairSignedById(repairSigner != null ? repairSigner.getEmployeeId() : null)
                                .repairSignedByName(repairSigner != null ? repairSigner.getName() : null)
                                .repairSignedAt(ta.getRepairSignedAt())
                                // Operation sign
                                .operationSignedById(opSigner != null ? opSigner.getEmployeeId() : null)
                                .operationSignedByName(opSigner != null ? opSigner.getName() : null)
                                .operationSignedAt(ta.getOperationSignedAt())
                                .build();
        }

        // ── PDF helpers ───────────────────────────────────────────────────────────

        private String generateAssessmentNumber() {
                String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy-MM-dd"));
                long next = 1;
                String candidate;
                do {
                        candidate = String.format("BBKT-%s-%04d", datePrefix, next);
                        next++;
                } while (assessmentRepository.existsByAssessmentNumber(candidate));
                return candidate;
        }
}
