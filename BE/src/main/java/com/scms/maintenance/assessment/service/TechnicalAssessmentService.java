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

                        // Font: dùng Helvetica (built-in, không cần file font)
                        // Nếu cần tiếng Việt đầy đủ, thay bằng font TTF khi có mẫu chính thức
                        PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold", PdfEncodings.WINANSI,
                                        PdfFontFactory.EmbeddingStrategy.PREFER_NOT_EMBEDDED);
                        PdfFont normalFont = PdfFontFactory.createFont("Helvetica", PdfEncodings.WINANSI,
                                        PdfFontFactory.EmbeddingStrategy.PREFER_NOT_EMBEDDED);

                        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

                        // ── Tiêu đề ──────────────────────────────────────────────────────
                        Paragraph title = new Paragraph("BIEN BAN DANH GIA KY THUAT")
                                        .setFont(boldFont)
                                        .setFontSize(16)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginBottom(4);
                        document.add(title);

                        addSectionTitle(document, boldFont, "I. THONG TIN BIENT BAN");

                        Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 35, 65 }))
                                        .setWidth(UnitValue.createPercentValue(100));

                        addInfoRow(infoTable, normalFont, boldFont, "Ma bien ban:",
                                        ta.getAssessmentNumber() != null ? ta.getAssessmentNumber() : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Ngay lap:",
                                        ta.getCreatedAt() != null ? ta.getCreatedAt().format(dtf) : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Nguoi lap:",
                                        ta.getCreatedBy() != null ? ta.getCreatedBy().getName() : "");
                        addInfoRow(infoTable, normalFont, boldFont, "Chuc vu:",
                                        ta.getCreatedBy() != null && ta.getCreatedBy().getPosition() != null
                                                        ? ta.getCreatedBy().getPosition().getPositionName()
                                                        : "");
                        document.add(infoTable);

                        // ── Thông tin thiết bị ────────────────────────────────────────────
                        addSectionTitle(document, boldFont, "II. THONG TIN THIET BI");

                        Equipment eq = ta.getEquipment();
                        Table eqTable = new Table(UnitValue.createPercentArray(new float[] { 35, 65 }))
                                        .setWidth(UnitValue.createPercentValue(100));

                        addInfoRow(eqTable, normalFont, boldFont, "Ma KKS:", eq != null ? eq.getKksCode() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Ten thiet bi:", eq != null ? eq.getEquipmentName() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Loai:", eq != null ? eq.getEquipmentType() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Vi tri:", eq != null ? eq.getLocation() : "");
                        addInfoRow(eqTable, normalFont, boldFont, "Trang thai:", eq != null ? eq.getStatus() : "");
                        document.add(eqTable);

                        // ── Nội dung đánh giá ─────────────────────────────────────────────
                        addSectionTitle(document, boldFont, "III. MO TA HU HONG");
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

                        addSectionTitle(document, boldFont, "IV. PHUONG AN XU LY DE XUAT");
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
                        addSectionTitle(document, boldFont, "V. KY TEN XAC NHAN");

                        Table signTable = new Table(UnitValue.createPercentArray(new float[] { 50, 50 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginTop(10);

                        // Ô ký bên sửa chữa
                        Cell repairCell = new Cell()
                                        .setBorder(Border.NO_BORDER)
                                        .setPadding(10);
                        repairCell.add(new Paragraph("BEN SUA CHUA").setFont(boldFont).setFontSize(11)
                                        .setTextAlignment(TextAlignment.CENTER));
                        if (ta.getRepairSignedBy() != null) {
                                repairCell.add(new Paragraph("Da ky: " + ta.getRepairSignedBy().getName())
                                                .setFont(normalFont).setFontSize(10)
                                                .setTextAlignment(TextAlignment.CENTER));
                                repairCell.add(new Paragraph(
                                                ta.getRepairSignedAt() != null ? ta.getRepairSignedAt().format(df) : "")
                                                .setFont(normalFont).setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER));
                        } else {
                                repairCell.add(new Paragraph("\n\n\n\n(Chu ky va ho ten)").setFont(normalFont)
                                                .setFontSize(10).setTextAlignment(TextAlignment.CENTER));
                        }
                        signTable.addCell(repairCell);

                        // Ô ký bên vận hành
                        Cell opCell = new Cell()
                                        .setBorder(Border.NO_BORDER)
                                        .setPadding(10);
                        opCell.add(new Paragraph("BEN VAN HANH").setFont(boldFont).setFontSize(11)
                                        .setTextAlignment(TextAlignment.CENTER));
                        if (ta.getOperationSignedBy() != null) {
                                opCell.add(new Paragraph("Da ky: " + ta.getOperationSignedBy().getName())
                                                .setFont(normalFont).setFontSize(10)
                                                .setTextAlignment(TextAlignment.CENTER));
                                opCell.add(new Paragraph(
                                                ta.getOperationSignedAt() != null ? ta.getOperationSignedAt().format(df)
                                                                : "")
                                                .setFont(normalFont).setFontSize(9)
                                                .setTextAlignment(TextAlignment.CENTER));
                        } else {
                                opCell.add(new Paragraph("\n\n\n\n(Chu ky va ho ten)").setFont(normalFont)
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
                        throw new AppException(ErrorCode.INVALID_KEY);
                }
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                        throw new AppException(ErrorCode.INVALID_KEY);
                }

                try {
                        // Tạo thư mục nếu chưa có
                        Path uploadPath = Paths.get(pdfUploadDir);
                        if (!Files.exists(uploadPath)) {
                                Files.createDirectories(uploadPath);
                        }

                        // Tên file = assessmentId + timestamp để tránh trùng
                        String fileName = "assessment_" + assessmentId + "_signed_" + System.currentTimeMillis()
                                        + ".pdf";
                        Path targetPath = uploadPath.resolve(fileName);
                        file.transferTo(targetPath.toFile());

                        // Cập nhật pdf_url vào DB
                        ta.setPdfUrl(pdfUploadDir + "/" + fileName);
                        ta.setRepairSignedAt(
                                        ta.getRepairSignedAt() != null ? ta.getRepairSignedAt() : LocalDateTime.now());

                        assessmentRepository.save(ta);
                        log.info("Uploaded signed PDF for assessment {}: {}", assessmentId, fileName);

                        return toResponse(ta);

                } catch (IOException e) {
                        log.error("Lỗi khi lưu file PDF cho assessment {}", assessmentId, e);
                        throw new RuntimeException("Không thể lưu file PDF: " + e.getMessage(), e);
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
                long count = assessmentRepository.count();
                long next = count + 1;
                String candidate;
                do {
                        candidate = String.format("BB-DGKT-%04d", next);
                        next++;
                } while (assessmentRepository.existsByAssessmentNumber(candidate));
                return candidate;
        }
}
