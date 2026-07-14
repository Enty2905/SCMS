package com.scms.maintenance.assessment.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.employee.entity.Employee;
import com.scms.employee.repository.EmployeeRepository;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.repository.EquipmentRepository;
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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

        @Value("${app.upload.pdf-dir:uploads/pdf}")
        String pdfUploadDir;

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
         * Generate file PDF biên bản đánh giá kỹ thuật (layout tạm thời, thay thế sau
         * khi có mẫu chính thức)
         */
        @Transactional(readOnly = true)
        public byte[] exportPdf(UUID assessmentId) {
                TechnicalAssessment ta = assessmentRepository.findByIdWithDetails(assessmentId)
                                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

                try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                        PdfWriter writer = new PdfWriter(baos);
                        PdfDocument pdf = new PdfDocument(writer);
                        Document document = new Document(pdf, PageSize.A4);
                        document.setMargins(40, 50, 40, 50);

                        // Font: Load Arial từ thư mục Fonts của Windows để hỗ trợ tiếng Việt có dấu đầy đủ
                        // Nếu không tìm thấy font hệ thống, sẽ fallback về Helvetica (không dấu)
                        PdfFont boldFont;
                        PdfFont normalFont;
                        try {
                                String fontPath = "C:/Windows/Fonts/arial.ttf";
                                String boldFontPath = "C:/Windows/Fonts/arialbd.ttf";
                                normalFont = PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H,
                                                PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
                                boldFont = PdfFontFactory.createFont(boldFontPath, PdfEncodings.IDENTITY_H,
                                                PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
                        } catch (Exception e) {
                                log.warn("Không tìm thấy font Arial hệ thống, fallback sang Helvetica", e);
                                boldFont = PdfFontFactory.createFont("Helvetica-Bold", PdfEncodings.WINANSI,
                                                PdfFontFactory.EmbeddingStrategy.PREFER_NOT_EMBEDDED);
                                normalFont = PdfFontFactory.createFont("Helvetica", PdfEncodings.WINANSI,
                                                PdfFontFactory.EmbeddingStrategy.PREFER_NOT_EMBEDDED);
                        }

                        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

                        // ── Tiêu đề ──────────────────────────────────────────────────────
                        Paragraph title = new Paragraph("BIÊN BẢN ĐÁNH GIÁ KỸ THUẬT")
                                        .setFont(boldFont)
                                        .setFontSize(16)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(4);
                        document.add(title);

                        addSectionTitle(document, boldFont, "I. THÔNG TIN BIÊN BẢN");

                        Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 35, 65 }))
                                        .setWidth(UnitValue.createPercentValue(100));

                        addInfoRow(infoTable, normalFont, boldFont, "Mã biên bản:",
                                        ta.getAssessmentNumber() != null ? ta.getAssessmentNumber() : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Ngày lập:",
                                        ta.getCreatedAt() != null ? ta.getCreatedAt().format(dtf) : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Người lập:",
                                        ta.getCreatedBy() != null ? ta.getCreatedBy().getName() : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Chức vụ:",
                                        ta.getCreatedBy() != null && ta.getCreatedBy().getPosition() != null
                                                         ? ta.getCreatedBy().getPosition().getPositionName()
                                                         : "");
                        document.add(infoTable);

                        // ── Thông tin thiết bị ────────────────────────────────────────────
                        addSectionTitle(document, boldFont, "II. THÔNG TIN THIẾT BỊ");

                        Equipment eq = ta.getEquipment();
                        Table eqTable = new Table(UnitValue.createPercentArray(new float[] { 35, 65 }))
                                        .setWidth(UnitValue.createPercentValue(100));

                        addInfoRow(eqTable, normalFont, boldFont, "Mã KKS:", eq != null ? eq.getKksCode() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Tên thiết bị:", eq != null ? eq.getEquipmentName() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Loại:", eq != null ? eq.getEquipmentType() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Vị trí:", eq != null ? eq.getLocation() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Trạng thái:", eq != null ? eq.getStatus() : "");
                        document.add(eqTable);

                        // ── Nội dung đánh giá ─────────────────────────────────────────────
                        addSectionTitle(document, boldFont, "III. MÔ TẢ HƯ HỎNG");
                        String damageVal = ta.getDamageDescription();
                        if (damageVal == null || damageVal.trim().isEmpty()) {
                                damageVal = "......................................................................................................................................\n" +
                                            "......................................................................................................................................\n" +
                                            "......................................................................................................................................";
                        }
                        Paragraph damageDesc = new Paragraph(damageVal)
                                        .setFont(normalFont)
                                        .setFontSize(11)
                                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                                        .setPadding(8)
                                        .setMarginBottom(15);
                        document.add(damageDesc);

                        addSectionTitle(document, boldFont, "IV. PHƯƠNG ÁN XỬ LÝ ĐỀ XUẤT");
                        String actionVal = ta.getProposedAction();
                        if (actionVal == null || actionVal.trim().isEmpty()) {
                                actionVal = "......................................................................................................................................\n" +
                                            "......................................................................................................................................\n" +
                                            "......................................................................................................................................";
                        }
                        Paragraph proposedAction = new Paragraph(actionVal)
                                        .setFont(normalFont)
                                        .setFontSize(11)
                                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                                        .setPadding(8)
                                        .setMarginBottom(20);
                        document.add(proposedAction);

                        // ── Khung ký tên ──────────────────────────────────────────────────
                        addSectionTitle(document, boldFont, "V. KÝ TÊN XÁC NHẬN");

                        Table signTable = new Table(UnitValue.createPercentArray(new float[] { 50, 50 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginTop(10);

                        // Ô ký bên sửa chữa
                        Cell repairCell = new Cell()
                                        .setBorder(Border.NO_BORDER)
                                        .setPadding(10);
                        repairCell.add(new Paragraph("BÊN SỬA CHỮA").setFont(boldFont).setFontSize(11)
                                        .setTextAlignment(TextAlignment.CENTER));
                        if (ta.getRepairSignedBy() != null) {
                                repairCell.add(new Paragraph("Đã ký: " + ta.getRepairSignedBy().getName())
                                                .setFont(normalFont).setFontSize(10)
                                                .setTextAlignment(TextAlignment.CENTER));
                                repairCell.add(new Paragraph(
                                                ta.getRepairSignedAt() != null ? ta.getRepairSignedAt().format(df) : "")
                                                .setFont(normalFont).setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER));
                        } else {
                                repairCell.add(new Paragraph("\n\n\n\n(Chữ ký và họ tên)").setFont(normalFont)
                                                .setFontSize(10).setTextAlignment(TextAlignment.CENTER));
                        }
                        signTable.addCell(repairCell);

                        // Ô ký bên vận hành
                        Cell opCell = new Cell()
                                        .setBorder(Border.NO_BORDER)
                                        .setPadding(10);
                        opCell.add(new Paragraph("BÊN VẬN HÀNH").setFont(boldFont).setFontSize(11)
                                        .setTextAlignment(TextAlignment.CENTER));
                        if (ta.getOperationSignedBy() != null) {
                                opCell.add(new Paragraph("Đã ký: " + ta.getOperationSignedBy().getName())
                                                .setFont(normalFont).setFontSize(10)
                                                .setTextAlignment(TextAlignment.CENTER));
                                opCell.add(new Paragraph(
                                                ta.getOperationSignedAt() != null ? ta.getOperationSignedAt().format(df)
                                                                : "")
                                                .setFont(normalFont).setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER));
                        } else {
                                opCell.add(new Paragraph("\n\n\n\n(Chữ ký và họ tên)").setFont(normalFont)
                                                .setFontSize(10).setTextAlignment(TextAlignment.CENTER));
                        }
                        signTable.addCell(opCell);

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
         * Upload file PDF biên bản đã ký vật lý lên server
         * Lưu vào thư mục cấu hình (app.upload.pdf-dir) và cập nhật pdf_url trong DB
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
                        // Tạo thư mục nếu chưa có
                        Path uploadPath = Paths.get(pdfUploadDir).toAbsolutePath().normalize();
                        if (!Files.exists(uploadPath)) {
                                Files.createDirectories(uploadPath);
                        }

                        // Tên file = assessmentId + timestamp để tránh trùng
                        String fileName = "assessment_" + assessmentId + "_signed_" + System.currentTimeMillis()
                                        + ".pdf";
                        Path targetPath = uploadPath.resolve(fileName).toAbsolutePath().normalize();

                        // Sử dụng Files.copy để ghi luồng đầu vào vào đường dẫn đích
                        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                        // Cập nhật pdf_url vào DB
                        ta.setPdfUrl(pdfUploadDir + "/" + fileName);
                        ta.setRepairSignedAt(
                                        ta.getRepairSignedAt() != null ? ta.getRepairSignedAt() : LocalDateTime.now());

                        assessmentRepository.save(ta);
                        log.info("Uploaded signed PDF for assessment {}: {}", assessmentId, fileName);

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

                try {
                        Path path = Paths.get(ta.getPdfUrl());
                        return Files.readAllBytes(path);
                } catch (IOException e) {
                        log.error("Lỗi khi đọc file PDF đã ký {}", assessmentId, e);
                        throw new RuntimeException("Không thể đọc file PDF đã ký: " + e.getMessage(), e);
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

        private void addSectionTitle(Document doc, PdfFont font, String text) {
                doc.add(new Paragraph(text)
                                .setFont(font)
                                .setFontSize(12)
                                .setFontColor(ColorConstants.DARK_GRAY)
                                .setMarginTop(15)
                                .setMarginBottom(8));
        }

        private void addInfoRow(Table table, PdfFont normalFont, PdfFont boldFont, String label, String value) {
                table.addCell(new Cell()
                                .add(new Paragraph(label).setFont(boldFont).setFontSize(10))
                                .setBorder(Border.NO_BORDER)
                                .setPaddingBottom(4));
                table.addCell(new Cell()
                                .add(new Paragraph(value != null ? value : "").setFont(normalFont).setFontSize(10))
                                .setBorder(Border.NO_BORDER)
                                .setPaddingBottom(4));
        }

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
