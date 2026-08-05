package com.scms.maintenance.workorder.service;

import com.itextpdf.kernel.colors.ColorConstants;
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
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.common.pdf.PdfFontProvider;
import com.scms.employee.entity.Employee;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.maintenance.workorder.entity.WorkOrderMember;
import com.scms.maintenance.workorder.repository.WorkOrderMemberRepository;
import com.scms.maintenance.workorder.repository.WorkOrderRepository;
import com.scms.repairrequest.entity.RepairRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkOrderPdfService {

    WorkOrderRepository workOrderRepository;
    WorkOrderMemberRepository workOrderMemberRepository;

    @Value("${app.company.work-order-unit}")
    @NonFinal
    String workOrderUnit;

    @Transactional(readOnly = true)
    public byte[] exportPdf(UUID orderId) {
        WorkOrder wo = workOrderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));

        List<WorkOrderMember> members = workOrderMemberRepository.findByOrderIdWithEmployee(orderId);
        wo.getMembers().clear();
        wo.getMembers().addAll(members);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(30, 45, 30, 45);

            PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
            PdfFont normalFont = fonts.normal();
            PdfFont boldFont = fonts.bold();

            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH");
            DateTimeFormatter mf = DateTimeFormatter.ofPattern("mm");

            RepairRequest req = wo.getRequest();
            String equipmentLocation = (req != null && req.getEquipment() != null)
                    ? orBlank(req.getEquipment().getLocation()) : "";
            String kksCode = (req != null && req.getEquipment() != null)
                    ? orBlank(req.getEquipment().getKksCode()) : "";

            // ── Tiêu đề chính ────────────────────────────────────────────────────
            Paragraph mainHeader = new Paragraph("MẪU PHIẾU CÔNG TÁC")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(mainHeader);

            // ── Header Grid ──────────────────────────────────────────────────────
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{45, 55}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8);

            Cell leftCell = new Cell().setBorder(Border.NO_BORDER);
            leftCell.add(new Paragraph("TÊN ĐƠN VỊ CẤP PHIẾU").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            leftCell.add(new Paragraph("ĐƠN VỊ: " + workOrderUnit).setFont(normalFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            headerTable.addCell(leftCell);

            Cell rightCell = new Cell().setBorder(Border.NO_BORDER);
            rightCell.add(new Paragraph("PHIẾU CÔNG TÁC").setFont(boldFont).setFontSize(14).setTextAlignment(TextAlignment.CENTER));
            rightCell.add(new Paragraph("Số: " + orBlank(wo.getOrderNumber())).setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            headerTable.addCell(rightCell);

            document.add(headerTable);
            addSeparator(document);

            // ── Mục 1: Cấp cho ───────────────────────────────────────────────────
            document.add(section(boldFont, "1. Cấp cho:"));

            String leaderName = empName(wo.getWorkLeader());
            String leaderPos = empPos(wo.getWorkLeader());
            document.add(createFieldParagraph(normalFont, boldFont, "1.1. Người lãnh đạo công việc (nếu có):", 
                    leaderName.isEmpty() ? "" : leaderName + (leaderPos.isEmpty() ? "" : " – " + leaderPos)));

            String cmdName = empName(wo.getDirectCommander());
            String cmdPos = empPos(wo.getDirectCommander());
            document.add(createFieldParagraph(normalFont, boldFont, "1.2. Người chỉ huy trực tiếp:", 
                    cmdName.isEmpty() ? "" : cmdName + (cmdPos.isEmpty() ? "" : " – " + cmdPos)));

            int memberCount = members.size();
            document.add(createFieldParagraph(normalFont, boldFont, "1.3. Nhân viên đơn vị công tác (ghi số lượng người):", 
                    memberCount > 0 ? memberCount + " người (Chi tiết xem tại Mục 4)" : ""));

            String locText = (equipmentLocation.isEmpty() && kksCode.isEmpty()) ? ""
                    : (kksCode.isEmpty() ? equipmentLocation : kksCode + (equipmentLocation.isEmpty() ? "" : " – " + equipmentLocation));
            document.add(createFieldParagraph(normalFont, boldFont, "1.4. Địa điểm công tác:", locText));

            String content = orBlank(wo.getContent());
            document.add(createFieldParagraph(normalFont, boldFont, "1.5. Nội dung công tác:", content));

            Paragraph timePlanPara = new Paragraph().setMarginBottom(3);
            timePlanPara.add(new Text("1.6. Thời gian theo kế hoạch:").setFont(normalFont).setFontSize(10));
            document.add(timePlanPara);

            String startStr = fmtTime(wo.getStartDate(), tf, mf, df);
            String endStr = fmtTime(wo.getEndDate(), tf, mf, df);

            Paragraph startPara = new Paragraph().setMarginBottom(3);
            startPara.add(new Text("   - Bắt đầu công việc: ").setFont(normalFont).setFontSize(10));
            if (startStr.isEmpty()) {
                startPara.add(new Text("…… giờ …… phút, ngày …… tháng …… năm ……").setFont(normalFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            } else {
                startPara.add(new Text(startStr).setFont(boldFont).setFontSize(10));
            }
            document.add(startPara);

            Paragraph endPara = new Paragraph().setMarginBottom(3);
            endPara.add(new Text("   - Kết thúc công việc: ").setFont(normalFont).setFontSize(10));
            if (startStr.isEmpty() || endStr.isEmpty()) {
                endPara.add(new Text("…… giờ …… phút, ngày …… tháng …… năm ……").setFont(normalFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            } else {
                endPara.add(new Text(endStr).setFont(boldFont).setFontSize(10));
            }
            document.add(endPara);

            document.add(createFieldParagraph(normalFont, boldFont, "1.7. Điều kiện tiến hành công việc (ghi rõ cắt điện một phần hay hoàn toàn thiết bị, đường dây, đoạn đường dây):", ""));

            // Ngày cấp + Ký tên người cấp
            LocalDateTime createdAt = wo.getCreatedAt() != null ? wo.getCreatedAt() : LocalDateTime.now();
            
            Table creatorGrid = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(8)
                    .setMarginBottom(8)
                    .setKeepTogether(true);

            Cell infoCell = new Cell().setBorder(Border.NO_BORDER);
            infoCell.add(new Paragraph("Phiếu công tác cấp ngày " + createdAt.getDayOfMonth()
                    + " tháng " + createdAt.getMonthValue() + " năm " + createdAt.getYear()).setFont(normalFont).setFontSize(10));
            creatorGrid.addCell(infoCell);

            Cell signCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            signCell.add(new Paragraph("Người cấp phiếu").setFont(boldFont).setFontSize(10));
            signCell.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            signCell.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            creatorGrid.addCell(signCell);

            document.add(creatorGrid);
            addSeparator(document);

            // ── Mục 2: Thủ tục cho phép công tác ────────────────────────────────
            document.add(section(boldFont, "2. Thủ tục cho phép công tác"));
            document.add(createFieldParagraph(normalFont, boldFont, "2.1. Những thiết bị, đường dây đã cắt điện:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "2.2. Đã tiếp đất tại các vị trí:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "2.3. Đã làm rào chắn và treo biển báo tại:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "2.4. Phạm vi được phép làm việc:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "2.5. Cảnh báo mối nguy hiểm, biện pháp an toàn:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "2.6. Cho phép bắt đầu làm việc lúc:", ""));

            Table allowSignGrid = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(4)
                    .setMarginBottom(8)
                    .setKeepTogether(true);

            allowSignGrid.addCell(new Cell().setBorder(Border.NO_BORDER));
            Cell signer2 = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            signer2.add(new Paragraph("Người cho phép").setFont(boldFont).setFontSize(10));
            signer2.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            signer2.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            allowSignGrid.addCell(signer2);

            document.add(allowSignGrid);
            addSeparator(document);

            // ── Mục 3: Tiếp nhận nơi làm việc ───────────────────────────────────
            document.add(section(boldFont, "3. Tiếp nhận nơi làm việc"));
            document.add(createFieldParagraph(normalFont, boldFont, "3.1. Đã kiểm tra biện pháp an toàn tại hiện trường:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "3.2. Đã làm thêm các biện pháp an toàn tại:", ""));
            document.add(createFieldParagraph(normalFont, boldFont, "Bắt đầu tiến hành công việc lúc:", ""));

            Table receiverSignGrid = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(4)
                    .setMarginBottom(8)
                    .setKeepTogether(true);

            Cell signer3Left = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            signer3Left.add(new Paragraph("Người chỉ huy trực tiếp").setFont(boldFont).setFontSize(10));
            signer3Left.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            signer3Left.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            receiverSignGrid.addCell(signer3Left);

            Cell signer3Right = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            signer3Right.add(new Paragraph("Người giám sát an toàn điện").setFont(boldFont).setFontSize(10));
            signer3Right.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            signer3Right.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            receiverSignGrid.addCell(signer3Right);

            document.add(receiverSignGrid);
            addSeparator(document);

            // ── Mục 4: Danh sách nhân viên ───────────────────────────────────────
            document.add(section(boldFont, "4. Danh sách nhân viên đơn vị công tác (và thay đổi người nếu có)"));

            float[] memberColWidths = {8, 22, 14, 19, 12, 19, 6};
            Table memberTable = new Table(UnitValue.createPercentArray(memberColWidths))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8)
                    .setKeepTogether(true);

            memberTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("TT").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            memberTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Họ, tên").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            memberTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Bậc ATĐ\n(nếu có)").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            
            Cell inCell = new Cell(1, 2).add(new Paragraph("Vào vị trí làm việc").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245));
            memberTable.addHeaderCell(inCell);
            Cell outCell = new Cell(1, 2).add(new Paragraph("Ra khỏi vị trí làm việc").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245));
            memberTable.addHeaderCell(outCell);

            memberTable.addHeaderCell(new Cell().add(new Paragraph("Thời gian").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));
            memberTable.addHeaderCell(new Cell().add(new Paragraph("Ký/XN").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));
            memberTable.addHeaderCell(new Cell().add(new Paragraph("Thời gian").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));
            memberTable.addHeaderCell(new Cell().add(new Paragraph("Ký/XN").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));

            if (members.isEmpty()) {
                for (int i = 0; i < 3; i++) {
                    memberTable.addCell(cellVal(normalFont, String.valueOf(i + 1)));
                    for (int j = 0; j < 6; j++) {
                        memberTable.addCell(new Cell().add(new Paragraph(" ").setFont(normalFont).setFontSize(9)).setBorder(new SolidBorder(0.5f)).setMinHeight(18));
                    }
                }
            } else {
                int idx = 1;
                for (WorkOrderMember m : members) {
                    memberTable.addCell(cellVal(normalFont, String.valueOf(idx++)));
                    memberTable.addCell(cellVal(normalFont, m.getEmployee() != null ? orBlank(m.getEmployee().getName()) : ""));
                    memberTable.addCell(cellVal(normalFont, ""));
                    memberTable.addCell(cellVal(normalFont, m.getCheckInAt() != null ? m.getCheckInAt().format(df) : ""));
                    memberTable.addCell(cellVal(normalFont, ""));
                    memberTable.addCell(cellVal(normalFont, m.getCheckOutAt() != null ? m.getCheckOutAt().format(df) : ""));
                    memberTable.addCell(cellVal(normalFont, ""));
                }
            }
            document.add(memberTable);
            addSeparator(document);

            // ── Mục 5: Cho phép làm việc hàng ngày ──────────────────────────────
            document.add(section(boldFont, "5. Cho phép làm việc và kết thúc công tác hàng ngày, di chuyển nơi làm việc:"));
            float[] dailyColWidths = {8, 28, 16, 16, 16, 16};
            Table dailyTable = new Table(UnitValue.createPercentArray(dailyColWidths))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8)
                    .setKeepTogether(true);
            
            dailyTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("STT").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            dailyTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Địa điểm công tác").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            
            Cell timeCell = new Cell(1, 2).add(new Paragraph("Thời gian").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245));
            dailyTable.addHeaderCell(timeCell);
            
            dailyTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Người CHT\n(Ký/XN)").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));
            dailyTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Người cho phép\n(Ký/XN)").setFont(boldFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245)));

            dailyTable.addHeaderCell(new Cell().add(new Paragraph("Bắt đầu").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));
            dailyTable.addHeaderCell(new Cell().add(new Paragraph("Kết thúc").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).setBorder(new SolidBorder(0.5f)).setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(250, 250, 250)));

            for (int i = 1; i <= 3; i++) {
                dailyTable.addCell(cellVal(normalFont, String.valueOf(i)));
                for (int j = 1; j < 6; j++) {
                    dailyTable.addCell(new Cell().add(new Paragraph(" ").setFont(normalFont).setFontSize(9)).setBorder(new SolidBorder(0.5f)).setMinHeight(18));
                }
            }
            document.add(dailyTable);
            addSeparator(document);

            // ── Mục 6: Kết thúc công tác ─────────────────────────────────────────
            document.add(section(boldFont, "6. Kết thúc công tác:"));
            document.add(new Paragraph(
                    "6.1. Toàn bộ công tác đã kết thúc, dụng cụ đã thu dọn, người, tiếp đất và biện pháp an toàn do đơn vị công tác làm đã rút hết bảo đảm an toàn đóng điện. "
                    + "Người chỉ huy trực tiếp đơn vị công tác trả lại nơi làm việc cho Người cho phép…………………… chức vụ……………. đại diện đơn vị quản lý lúc…… giờ…… ngày…… tháng…… năm ………")
                    .setFont(normalFont).setFontSize(10).setMarginBottom(4));
            
            Table endSign1 = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8)
                    .setKeepTogether(true);
            endSign1.addCell(new Cell().setBorder(Border.NO_BORDER));
            Cell endSignCell1 = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            endSignCell1.add(new Paragraph("Người chỉ huy trực tiếp").setFont(boldFont).setFontSize(10));
            endSignCell1.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            endSignCell1.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            endSign1.addCell(endSignCell1);
            document.add(endSign1);

            document.add(new Paragraph(
                    "6.2. Đã tiếp nhận và kiểm tra nơi làm việc, phiếu công tác đã khóa lúc …… giờ …… phút ngày …… tháng …… năm ……")
                    .setFont(normalFont).setFontSize(10).setMarginBottom(4));

            Table endSign2 = new Table(UnitValue.createPercentArray(new float[]{33, 33, 34}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8)
                    .setKeepTogether(true);

            Cell cellSignA = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            cellSignA.add(new Paragraph("Người cho phép").setFont(boldFont).setFontSize(10));
            cellSignA.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            cellSignA.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            endSign2.addCell(cellSignA);

            Cell cellSignB = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            cellSignB.add(new Paragraph("Người cấp phiếu").setFont(boldFont).setFontSize(10));
            cellSignB.add(new Paragraph("(Ký và ghi rõ họ tên)").setFont(normalFont).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            cellSignB.add(new Paragraph("\n\n\n").setFont(normalFont).setFontSize(10));
            endSign2.addCell(cellSignB);

            Cell cellSignC = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            cellSignC.add(new Paragraph("Đã hoàn thành phiếu ngày").setFont(normalFont).setFontSize(9));
            cellSignC.add(new Paragraph("……/……/20……").setFont(normalFont).setFontSize(9));
            endSign2.addCell(cellSignC);
            
            document.add(endSign2);
            addSeparator(document);

            // ── Ghi chú ─────────────────────────────────────────────────────────
            document.add(new Paragraph(
                    "Ghi chú: Tùy theo tổ chức sản xuất và điều kiện thực tế, tổ chức, cá nhân tham gia hoạt động điện lực, sử dụng điện được phép ban hành bổ sung trong phiếu công tác nội dung các công việc khác như thủy, cơ, nhiệt, hóa (nếu cần thiết) nhưng phải bảo đảm đầy đủ theo điểm 46 Quy chuẩn này.")
                    .setFont(normalFont).setFontSize(8.5f)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setMarginTop(4));

            document.close();
            return baos.toByteArray();
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("Lỗi xuất PDF phiếu công tác", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private void addSeparator(Document doc) {
        doc.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.5f))
                .setMarginTop(4).setMarginBottom(4));
    }

    private Paragraph section(PdfFont font, String text) {
        return new Paragraph(text).setFont(font).setFontSize(10)
                .setFontColor(ColorConstants.BLACK).setMarginTop(4).setMarginBottom(2);
    }

    private Paragraph createFieldParagraph(PdfFont normalFont, PdfFont boldFont, String label, String value) {
        Paragraph p = new Paragraph().setMarginBottom(3);
        p.add(new Text(label).setFont(normalFont).setFontSize(10));
        p.add(new Text(" ").setFont(normalFont).setFontSize(10));
        if (value == null || value.trim().isEmpty()) {
            p.add(new Text("………………………………………………………………………………………………………………………………………………").setFont(normalFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
        } else {
            p.add(new Text(value).setFont(boldFont).setFontSize(10).setFontColor(ColorConstants.BLACK));
        }
        return p;
    }

    private Cell cellVal(PdfFont font, String text) {
        return new Cell().add(new Paragraph(text != null ? text : "").setFont(font).setFontSize(9).setTextAlignment(TextAlignment.CENTER))
                .setBorder(new SolidBorder(0.5f)).setMinHeight(18).setPadding(3);
    }

    private String empName(Employee emp) {
        return emp != null ? orBlank(emp.getName()) : "";
    }

    private String empPos(Employee emp) {
        return (emp != null && emp.getPosition() != null)
                ? orBlank(emp.getPosition().getPositionName()) : "";
    }

    private String orBlank(String s) {
        return s != null ? s : "";
    }

    private String fmtTime(LocalDateTime dt, DateTimeFormatter hf, DateTimeFormatter mf, DateTimeFormatter df) {
        if (dt == null) return "";
        return dt.format(hf) + " giờ " + dt.format(mf) + " phút, ngày " + dt.getDayOfMonth()
                + " tháng " + dt.getMonthValue() + " năm " + dt.getYear();
    }
}
