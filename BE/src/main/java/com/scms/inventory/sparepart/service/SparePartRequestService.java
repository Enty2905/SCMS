package com.scms.inventory.sparepart.service;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.pdf.PdfFontProvider;
import com.scms.common.service.CloudinaryService;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.inventory.sparepart.dto.request.CreateSparePartRequestDto;
import com.scms.inventory.sparepart.dto.request.IssueSparePartRequestDto;
import com.scms.inventory.sparepart.dto.response.SparePartRequestItemResponse;
import com.scms.inventory.sparepart.dto.response.SparePartRequestResponse;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.entity.SparePartExport;
import com.scms.inventory.sparepart.entity.SparePartExportItem;
import com.scms.inventory.sparepart.entity.SparePartRequest;
import com.scms.inventory.sparepart.entity.SparePartRequestItem;
import com.scms.inventory.sparepart.repository.SparePartExportItemRepository;
import com.scms.inventory.sparepart.repository.SparePartExportRepository;
import com.scms.inventory.sparepart.repository.SparePartRepository;
import com.scms.inventory.sparepart.repository.SparePartRequestItemRepository;
import com.scms.inventory.sparepart.repository.SparePartRequestRepository;
import com.scms.inventory.sparepart.repository.SparePartStockRepository;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.maintenance.workorder.repository.WorkOrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import lombok.experimental.NonFinal;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.properties.VerticalAlignment;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SparePartRequestService {

    SparePartRequestRepository sparePartRequestRepository;
    WorkOrderRepository workOrderRepository;
    SparePartRepository sparePartRepository;
    UserRepository userRepository;
    SparePartExportItemRepository sparePartExportItemRepository;
    SparePartExportRepository sparePartExportRepository;
    SparePartRequestItemRepository sparePartRequestItemRepository;
    SparePartStockRepository sparePartStockRepository;
    CloudinaryService cloudinaryService;

    @Value("${app.company.request:CÔNG TY SCSM}")
    @NonFinal
    String companyRequest;

    @Transactional
    public SparePartRequestResponse createRequest(CreateSparePartRequestDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        WorkOrder workOrder = null;
        if (dto.getOrderId() != null) {
            workOrder = workOrderRepository.findById(dto.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));
        }

        String reqNumber = generateReqNumber();

        SparePartRequest request = SparePartRequest.builder()
                .reqNumber(reqNumber)
                .workOrder(workOrder)
                .status("pending")
                .createdBy(user)
                .build();

        List<SparePartRequestItem> items = new ArrayList<>();
        for (CreateSparePartRequestDto.ItemRequest itemReq : dto.getItems()) {
            SparePart sparePart = sparePartRepository.findById(itemReq.getSparePartId())
                    .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));

            SparePartRequestItem item = SparePartRequestItem.builder()
                    .sparePartRequest(request)
                    .sparePart(sparePart)
                    .quantityRequested(itemReq.getQuantityRequested())
                    .quantityIssued(0)
                    .build();
            items.add(item);
        }

        request.setItems(items);
        sparePartRequestRepository.save(request);

        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public Page<SparePartRequestResponse> getRequests(String reqNumber, String orderNumber, String status, Pageable pageable) {
        return sparePartRequestRepository.findByFilters(reqNumber, orderNumber, status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SparePartRequestResponse getRequestById(UUID reqId) {
        SparePartRequest request = sparePartRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(request);
    }

    /**
     * Nghiệp vụ cấp phát phụ tùng thay thế:
     * 1. Validate phiếu phải ở trạng thái "pending"
     * 2. Với từng item: kiểm tra tồn kho >= quantityIssued
     * 3. Ghi SparePartExportItem (trừ tồn kho)
     * 4. Cập nhật quantityIssued trong SparePartRequestItem
     * 5. Chuyển status → "issued", lưu issuedBy, issuedAt
     */
    @Transactional
    public SparePartRequestResponse issueRequest(UUID reqId, IssueSparePartRequestDto dto, String username) {
        User issuer = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        SparePartRequest request = sparePartRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!"pending".equals(request.getStatus())) {
            throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS);
        }

        // Build map itemId → IssuedItem
        Map<UUID, IssueSparePartRequestDto.IssuedItem> issuedMap = dto.getItems().stream()
                .collect(Collectors.toMap(IssueSparePartRequestDto.IssuedItem::getItemId, Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        SparePartExport export = SparePartExport.builder()
                .exportNumber(generateExportNumber())
                .sparePartRequest(request)
                .workOrder(request.getWorkOrder())
                .exportedBy(issuer)
                .exportedAt(now)
                .note(dto.getNote())
                .build();

        for (SparePartRequestItem requestItem : request.getItems()) {
            IssueSparePartRequestDto.IssuedItem issuedItem = issuedMap.get(requestItem.getItemId());
            if (issuedItem == null) continue;

            int qtyToIssue = issuedItem.getQuantityIssued();

            // Kiểm tra tồn kho
            long imported = sparePartStockRepository.sumImported(requestItem.getSparePart().getSparePartId());
            long exported = sparePartStockRepository.sumExported(requestItem.getSparePart().getSparePartId().toString());
            long currentStock = imported - exported;

            if (currentStock < qtyToIssue) {
                log.warn("Không đủ tồn kho cho phụ tùng {}: tồn={}, yêu cầu={}",
                        requestItem.getSparePart().getCode(), currentStock, qtyToIssue);
                throw new AppException(ErrorCode.NOT_ENOUGH_INVENTORY);
            }

            // Ghi export item (trừ tồn kho)
            SparePartExportItem exportItem = SparePartExportItem.builder()
                    .sparePart(requestItem.getSparePart())
                    .sparePartExport(export)
                    .quantity(qtyToIssue)
                    .note(dto.getNote())
                    .build();
            export.getItems().add(exportItem);

            // Cập nhật quantityIssued trong request item
            requestItem.setQuantityIssued(qtyToIssue);
        }

        if (!export.getItems().isEmpty()) {
            sparePartExportRepository.save(export);
        }
        sparePartRequestItemRepository.saveAll(request.getItems());

        // Cập nhật trạng thái phiếu
        request.setStatus("issued");
        request.setIssuedBy(issuer);
        request.setIssuedAt(now);
        request.setNote(dto.getNote());
        sparePartRequestRepository.save(request);

        log.info("Đã cấp phát phụ tùng thay thế cho phiếu {} bởi {}", request.getReqNumber(), username);
        return toResponse(request);
    }

    /**
     * Upload PDF phiếu cấp phát đã ký lên Cloudinary và lưu URL vào phiếu.
     */
    @Transactional
    public SparePartRequestResponse uploadSignedPdf(UUID reqId, MultipartFile file) {
        SparePartRequest request = sparePartRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        String pdfUrl = cloudinaryService.uploadFile(file, "scms/spare-part-requests");
        request.setPdfUrl(pdfUrl);
        sparePartRequestRepository.save(request);

        log.info("Đã upload PDF phiếu cấp phụ tùng thay thế {} lên Cloudinary: {}", request.getReqNumber(), pdfUrl);
        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(UUID reqId) {
        SparePartRequest request = sparePartRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(30, 40, 30, 40);

            PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
            PdfFont normalFont = fonts.normal();
            PdfFont boldFont = fonts.bold();

            // ── Header Table (2 columns) ──────────────────────────────────────
            Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 50, 50 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(15);

            // Left column (Company only and request number)
            Cell leftHeaderCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            leftHeaderCell.add(new Paragraph(companyRequest)
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setMarginBottom(4));
            
            String reqNumStr = request.getReqNumber() != null ? request.getReqNumber() : "....";
            leftHeaderCell.add(new Paragraph("Số: " + reqNumStr + "/PX")
                    .setFont(normalFont)
                    .setFontSize(9));

            // Right column (National motto/Decision header)
            Cell rightHeaderCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            rightHeaderCell.add(new Paragraph("Biểu số 03-TT")
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setMarginBottom(1));
            rightHeaderCell.add(new Paragraph("(Ban hành theo quyết định số 15/2006/QĐ-BTC ngày\n20/03/2006 của Bộ Tài Chính)")
                    .setFont(normalFont)
                    .setFontSize(8)
                    .setItalic());

            headerTable.addCell(leftHeaderCell);
            headerTable.addCell(rightHeaderCell);
            document.add(headerTable);

            // ── Document Title ────────────────────────────────────────────────
            Paragraph title = new Paragraph("GIẤY ĐỀ NGHỊ XUẤT KHO VẬT TƯ")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(2);
            document.add(title);

            Paragraph datePara = new Paragraph("Ngày ..... tháng ..... năm .....")
                    .setFont(normalFont)
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(8);
            document.add(datePara);

            // Right aligned warehouse/slip/date block
            Paragraph rightInfo = new Paragraph()
                    .setFont(normalFont)
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(10);
            rightInfo.add(new Text("Xuất tại kho: ........................................................................\n"));
            rightInfo.add(new Text("Số phiếu xuất: ........................................................................\n"));
            rightInfo.add(new Text("Ngày: ........................................................................"));
            document.add(rightInfo);

            Paragraph subtitle = new Paragraph("Kính gửi: ........................................................................")
                    .setFont(normalFont)
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(12);
            document.add(subtitle);

            // ── Requester & Reason Details ────────────────────────────────────
            // 1. Người đề nghị
            Paragraph p1 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(4);
            p1.add(new Text("1. Người đề nghị: ").setFont(boldFont));
            p1.add(new Text("..................................................").setFont(normalFont));
            document.add(p1);

            // 2. Lý do sử dụng
            Paragraph p2 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(4);
            p2.add(new Text("2. Lý do sử dụng: ").setFont(boldFont));
            String note = request.getNote() != null ? request.getNote() : "";
            p2.add(new Text(note.isEmpty() ? "................................................................" : note).setFont(normalFont));
            
            String woNum = request.getWorkOrder() != null ? request.getWorkOrder().getOrderNumber() : "";
            p2.add(new Text("    WO: ").setFont(boldFont));
            p2.add(new Text(woNum.isEmpty() ? "................" : woNum).setFont(normalFont));

            String kksCode = "";
            if (request.getWorkOrder() != null && request.getWorkOrder().getRequest() != null && request.getWorkOrder().getRequest().getEquipment() != null) {
                kksCode = request.getWorkOrder().getRequest().getEquipment().getKksCode();
            }
            p2.add(new Text("    KKS: ").setFont(boldFont));
            p2.add(new Text(kksCode == null || kksCode.isEmpty() ? "................" : kksCode).setFont(normalFont));
            document.add(p2);

            // 3. Đề nghị lĩnh số vật tư dưới đây:
            Paragraph p3 = new Paragraph("3. Đề nghị lĩnh số vật tư dưới đây:")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setMarginBottom(6);
            document.add(p3);

            // ── Items Table ──────────────────────────────────────────────────
            Table itemsTable = new Table(UnitValue.createPercentArray(new float[] { 8, 15, 37, 10, 10, 10, 10 }))
                    .setWidth(UnitValue.createPercentValue(100));

            // Row 1 Header
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("STT").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Mã vật tư").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Tên vật tư và quy cách").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("ĐVT").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(1, 2).add(new Paragraph("Số lượng").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Ghi chú").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));

            // Row 2 Header
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Cần").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Cấp").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));

            int index = 1;
            for (SparePartRequestItem item : request.getItems()) {
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getCode() != null ? item.getSparePart().getCode() : "").setFont(normalFont).setFontSize(9)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getName() != null ? item.getSparePart().getName() : "").setFont(normalFont).setFontSize(9)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getUnit() != null ? item.getSparePart().getUnit() : "").setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantityRequested())).setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                
                String issuedText = "";
                if (!"pending".equalsIgnoreCase(request.getStatus()) && item.getQuantityIssued() != null) {
                    issuedText = String.valueOf(item.getQuantityIssued());
                }
                itemsTable.addCell(new Cell().add(new Paragraph(issuedText).setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                itemsTable.addCell(new Cell().add(new Paragraph("").setFont(normalFont).setFontSize(9)));
            }

            document.add(itemsTable);

            // ── Signatures block ─────────────────────────────────────────────
            Table signTable = new Table(UnitValue.createPercentArray(new float[] { 33, 34, 33 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(30);

            // Column 1: NGƯỜI YÊU CẦU
            Cell requesterCell = new Cell().setBorder(Border.NO_BORDER);
            requesterCell.add(new Paragraph("NGƯỜI YÊU CẦU")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(2));
            requesterCell.add(new Paragraph("(Ký và ghi họ tên)")
                    .setFont(normalFont)
                    .setFontSize(8)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(60));

            // Column 2: NGƯỜI CẤP PHÁT
            Cell issuerCell = new Cell().setBorder(Border.NO_BORDER);
            issuerCell.add(new Paragraph("NGƯỜI CẤP PHÁT")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(2));
            issuerCell.add(new Paragraph("(Ký và ghi họ tên)")
                    .setFont(normalFont)
                    .setFontSize(8)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(60));

            // Column 3: NGƯỜI NHẬN
            Cell receiverCell = new Cell().setBorder(Border.NO_BORDER);
            receiverCell.add(new Paragraph("NGƯỜI NHẬN")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(2));
            receiverCell.add(new Paragraph("(Ký và ghi họ tên)")
                    .setFont(normalFont)
                    .setFontSize(8)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(60));

            signTable.addCell(requesterCell);
            signTable.addCell(issuerCell);
            signTable.addCell(receiverCell);
            document.add(signTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi xuất PDF phiếu cấp phụ tùng", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }



    private String generateReqNumber() {
        String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy-MM-dd"));
        long next = 1;
        String candidate;
        do {
            candidate = String.format("YCVTT-%s-%04d", datePrefix, next);
            next++;
        } while (sparePartRequestRepository.existsByReqNumber(candidate));
        return candidate;
    }

    private SparePartRequestResponse toResponse(SparePartRequest r) {
        if (r == null) return null;

        List<SparePartRequestItemResponse> items = r.getItems().stream()
                .map(item -> SparePartRequestItemResponse.builder()
                        .itemId(item.getItemId())
                        .sparePartId(item.getSparePart().getSparePartId())
                        .code(item.getSparePart().getCode())
                        .name(item.getSparePart().getName())
                        .unit(item.getSparePart().getUnit())
                        .quantityRequested(item.getQuantityRequested())
                        .quantityIssued(item.getQuantityIssued())
                        .build())
                .toList();

        return SparePartRequestResponse.builder()
                .reqId(r.getReqId())
                .reqNumber(r.getReqNumber())
                .orderId(r.getWorkOrder() != null ? r.getWorkOrder().getOrderId() : null)
                .orderNumber(r.getWorkOrder() != null ? r.getWorkOrder().getOrderNumber() : null)
                .status(r.getStatus())
                .pdfUrl(r.getPdfUrl())
                .createdByUsername(r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null)
                .createdByName(r.getCreatedBy() != null && r.getCreatedBy().getEmployee() != null
                        ? r.getCreatedBy().getEmployee().getName() : null)
                .createdAt(r.getCreatedAt())
                .issuedByName(r.getIssuedBy() != null && r.getIssuedBy().getEmployee() != null
                        ? r.getIssuedBy().getEmployee().getName()
                        : (r.getIssuedBy() != null ? r.getIssuedBy().getUsername() : null))
                .issuedAt(r.getIssuedAt())
                .note(r.getNote())
                .items(items)
                .build();
    }

    private String generateExportNumber() {
        String datePrefix = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("yy-MM-dd"));
        long next = 1;
        String candidate;
        do {
            candidate = String.format("XKTT-%s-%04d", datePrefix, next);
            next++;
        } while (sparePartExportRepository.existsByExportNumber(candidate));
        return candidate;
    }


}
