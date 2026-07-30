package com.scms.inventory.consumable.service;

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
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.common.service.CloudinaryService;
import com.scms.common.service.NotificationService;
import com.scms.common.pdf.PdfFontProvider;
import com.scms.inventory.consumable.dto.request.CreateConsumableRequestDto;
import com.scms.inventory.consumable.dto.request.IssueConsumableRequestDto;
import com.scms.inventory.consumable.dto.response.ConsumableRequestItemResponse;
import com.scms.inventory.consumable.dto.response.ConsumableRequestResponse;
import com.scms.inventory.consumable.entity.Consumable;
import com.scms.inventory.consumable.entity.ConsumableExport;
import com.scms.inventory.consumable.entity.ConsumableExportItem;
import com.scms.inventory.consumable.entity.ConsumableRequest;
import com.scms.inventory.consumable.entity.ConsumableRequestItem;
import com.scms.inventory.consumable.repository.ConsumableExportItemRepository;
import com.scms.inventory.consumable.repository.ConsumableExportRepository;
import com.scms.inventory.consumable.repository.ConsumableRepository;
import com.scms.inventory.consumable.repository.ConsumableRequestItemRepository;
import com.scms.inventory.consumable.repository.ConsumableRequestRepository;
import com.scms.inventory.consumable.repository.ConsumableStockRepository;
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
public class ConsumableRequestService {

    ConsumableRequestRepository consumableRequestRepository;
    WorkOrderRepository workOrderRepository;
    ConsumableRepository consumableRepository;
    UserRepository userRepository;
    ConsumableExportRepository consumableExportRepository;
    ConsumableRequestItemRepository consumableRequestItemRepository;
    ConsumableStockRepository consumableStockRepository;
    CloudinaryService cloudinaryService;
    NotificationService notificationService;

    @Value("${app.company.request:CÔNG TY SCSM}")
    @NonFinal
    String companyRequest;

    @Transactional
    public ConsumableRequestResponse createRequest(CreateConsumableRequestDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        WorkOrder workOrder = null;
        if (dto.getOrderId() != null) {
            workOrder = workOrderRepository.findById(dto.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_ORDER_NOT_FOUND));
        }

        String reqNumber = generateReqNumber();

        ConsumableRequest request = ConsumableRequest.builder()
                .reqNumber(reqNumber)
                .workOrder(workOrder)
                .status("pending")
                .createdBy(user)
                .build();

        List<ConsumableRequestItem> items = new ArrayList<>();
        for (CreateConsumableRequestDto.ItemRequest itemReq : dto.getItems()) {
            Consumable consumable = consumableRepository.findById(itemReq.getConsumableId())
                    .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));

            ConsumableRequestItem item = ConsumableRequestItem.builder()
                    .consumableRequest(request)
                    .consumable(consumable)
                    .quantityRequested(itemReq.getQuantityRequested())
                    .quantityIssued(0)
                    .build();
            items.add(item);
        }

        request.setItems(items);
        consumableRequestRepository.save(request);

        ConsumableRequestResponse response = toResponse(request);
        notificationService.sendMaterialRequestNotification(response);
        return response;
    }

    @Transactional(readOnly = true)
    public Page<ConsumableRequestResponse> getRequests(String reqNumber, String orderNumber, String status, Pageable pageable) {
        return consumableRequestRepository.findByFilters(reqNumber, orderNumber, status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ConsumableRequestResponse getRequestById(UUID reqId) {
        ConsumableRequest request = consumableRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(request);
    }

    /**
     * Nghiệp vụ cấp phát vật tư tiêu hao:
     * 1. Validate phiếu phải ở trạng thái "pending"
     * 2. Với từng item: kiểm tra tồn kho >= quantityIssued
     * 3. Ghi ConsumableExportItem (trừ tồn kho)
     * 4. Cập nhật quantityIssued trong ConsumableRequestItem
     * 5. Chuyển status → "issued", lưu issuedBy, issuedAt
     */
    @Transactional
    public ConsumableRequestResponse issueRequest(UUID reqId, IssueConsumableRequestDto dto, String username) {
        User issuer = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ConsumableRequest request = consumableRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!"pending".equals(request.getStatus())) {
            throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS);
        }

        // Build map itemId → IssuedItem
        Map<UUID, IssueConsumableRequestDto.IssuedItem> issuedMap = dto.getItems().stream()
                .collect(Collectors.toMap(IssueConsumableRequestDto.IssuedItem::getItemId, Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        ConsumableExport export = ConsumableExport.builder()
                .exportNumber(generateExportNumber())
                .consumableRequest(request)
                .workOrder(request.getWorkOrder())
                .exportedBy(issuer)
                .exportedAt(now)
                .note(dto.getNote())
                .build();

        for (ConsumableRequestItem requestItem : request.getItems()) {
            IssueConsumableRequestDto.IssuedItem issuedItem = issuedMap.get(requestItem.getItemId());
            if (issuedItem == null) continue; // Bỏ qua nếu không có trong dto (không cấp)

            int qtyToIssue = issuedItem.getQuantityIssued();

            if (qtyToIssue > requestItem.getQuantityRequested()) {
                log.warn("Số lượng cấp phát vượt quá yêu cầu cho vật tư {}: yêu cầu={}, cấp={}",
                        requestItem.getConsumable().getCode(), requestItem.getQuantityRequested(), qtyToIssue);
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            // Kiểm tra tồn kho
            long imported = consumableStockRepository.sumImported(requestItem.getConsumable().getConsumableId());
            long exported = consumableStockRepository.sumExported(requestItem.getConsumable().getConsumableId().toString());
            long currentStock = imported - exported;

            if (currentStock < qtyToIssue) {
                log.warn("Không đủ tồn kho cho vật tư {}: tồn={}, yêu cầu={}",
                        requestItem.getConsumable().getCode(), currentStock, qtyToIssue);
                throw new AppException(ErrorCode.NOT_ENOUGH_INVENTORY);
            }

            // Ghi export item (trừ tồn kho)
            ConsumableExportItem exportItem = ConsumableExportItem.builder()
                    .consumable(requestItem.getConsumable())
                    .consumableExport(export)
                    .quantity(qtyToIssue)
                    .note(dto.getNote())
                    .build();
            export.getItems().add(exportItem);

            // Cập nhật quantityIssued trong request item
            requestItem.setQuantityIssued(qtyToIssue);
        }

        if (!export.getItems().isEmpty()) {
            consumableExportRepository.save(export);
        }
        consumableRequestItemRepository.saveAll(request.getItems());

        // Cập nhật trạng thái phiếu
        request.setStatus("issued");
        request.setIssuedBy(issuer);
        request.setIssuedAt(now);
        request.setNote(dto.getNote());
        consumableRequestRepository.save(request);

        log.info("Đã cấp phát vật tư tiêu hao cho phiếu {} bởi {}", request.getReqNumber(), username);
        ConsumableRequestResponse issuedResponse = toResponse(request);

        // Gửi thông báo phản hồi real-time về cho người tạo phiếu
        java.util.Map<String, Object> responseNotif = new java.util.HashMap<>();
        responseNotif.put("reqId", issuedResponse.getReqId());
        responseNotif.put("reqNumber", issuedResponse.getReqNumber());
        responseNotif.put("status", "issued");
        responseNotif.put("type", "consumable");
        responseNotif.put("createdByUsername", issuedResponse.getCreatedByUsername());
        responseNotif.put("issuedByName", issuedResponse.getIssuedByName());
        notificationService.sendMaterialRequestResponseNotification(responseNotif);

        return issuedResponse;
    }

    /**
     * Thủ kho từ chối cấp phát vật tư tiêu hao.
     * Chỉ cho phép khi phiếu đang ở trạng thái pending.
     */
    @Transactional
    public ConsumableRequestResponse rejectRequest(UUID reqId, String reason, String username) {
        ConsumableRequest request = consumableRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!"pending".equals(request.getStatus())) {
            throw new AppException(ErrorCode.WORK_ORDER_INVALID_STATUS);
        }

        request.setStatus("rejected");
        request.setNote(reason);
        consumableRequestRepository.save(request);

        log.info("Phiếu vật tư tiêu hao {} đã bị từ chối bởi {} với lý do: {}", request.getReqNumber(), username, reason);
        ConsumableRequestResponse rejectedResponse = toResponse(request);

        // Gửi thông báo phản hồi real-time về cho người tạo phiếu
        java.util.Map<String, Object> responseNotif = new java.util.HashMap<>();
        responseNotif.put("reqId", rejectedResponse.getReqId());
        responseNotif.put("reqNumber", rejectedResponse.getReqNumber());
        responseNotif.put("status", "rejected");
        responseNotif.put("type", "consumable");
        responseNotif.put("reason", reason);
        responseNotif.put("createdByUsername", rejectedResponse.getCreatedByUsername());
        notificationService.sendMaterialRequestResponseNotification(responseNotif);

        return rejectedResponse;
    }

    /**
     * Upload PDF phiếu cấp phát đã ký lên Cloudinary và lưu URL vào phiếu.
     */
    @Transactional
    public ConsumableRequestResponse uploadSignedPdf(UUID reqId, MultipartFile file) {
        ConsumableRequest request = consumableRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        String pdfUrl = cloudinaryService.uploadFile(file, "scms/consumable-requests");
        request.setPdfUrl(pdfUrl);
        consumableRequestRepository.save(request);

        log.info("Đã upload PDF phiếu cấp vật tư tiêu hao {} lên Cloudinary: {}", request.getReqNumber(), pdfUrl);
        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(UUID reqId) {
        ConsumableRequest request = consumableRequestRepository.findByIdWithDetails(reqId)
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

            // Left column (Company and branch)
            Cell leftHeaderCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            leftHeaderCell.add(new Paragraph(companyRequest)
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setMarginBottom(4));
            
            String reqNumStr = request.getReqNumber() != null ? request.getReqNumber() : "....";
            leftHeaderCell.add(new Paragraph("Số: " + reqNumStr + "/PX")
                    .setFont(normalFont)
                    .setFontSize(9));

            // Right column (National motto & date)
            Cell rightHeaderCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
            rightHeaderCell.add(new Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setMarginBottom(1));
            rightHeaderCell.add(new Paragraph("Độc lập - Tự do - Hạnh phúc")
                    .setFont(boldFont)
                    .setFontSize(9)
                    .setUnderline()
                    .setMarginBottom(6));
            rightHeaderCell.add(new Paragraph("Ngày ..... tháng ..... năm .....")
                    .setFont(normalFont)
                    .setFontSize(9)
                    .setItalic());

            headerTable.addCell(leftHeaderCell);
            headerTable.addCell(rightHeaderCell);
            document.add(headerTable);

            // ── Document Title ────────────────────────────────────────────────
            Paragraph title = new Paragraph("GIẤY ĐỀ NGHỊ CẤP VẬT TƯ TIÊU HAO")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(4);
            document.add(title);

            Paragraph subtitle = new Paragraph("Kính gửi: ........................................................................")
                    .setFont(normalFont)
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(12);
            document.add(subtitle);

            // ── Requester & Reason Details ────────────────────────────────────
            // Tên người đề nghị, Tổ, Phân xưởng
            Paragraph p1 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(4);
            p1.add(new Text("Tên người đề nghị: ").setFont(boldFont));
            p1.add(new Text("..................................................").setFont(normalFont));
            p1.add(new Text("    Tổ: ").setFont(boldFont));
            p1.add(new Text("........................").setFont(normalFont));
            p1.add(new Text("    Phân xưởng: ").setFont(boldFont));
            String deptName = "";
            if (request.getCreatedBy() != null && request.getCreatedBy().getEmployee() != null && request.getCreatedBy().getEmployee().getDepartment() != null) {
                deptName = request.getCreatedBy().getEmployee().getDepartment().getDepartmentName();
            }
            p1.add(new Text(deptName.isEmpty() ? "........................" : deptName).setFont(normalFont));
            document.add(p1);

            // Lý do sử dụng
            Paragraph p2 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(4);
            p2.add(new Text("Lý do sử dụng: ").setFont(boldFont));
            String note = request.getNote() != null ? request.getNote() : "";
            p2.add(new Text(note.isEmpty() ? "................................................................................................................................................................................" : note).setFont(normalFont));
            document.add(p2);

            // PCT
            Paragraph p3 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(4);
            p3.add(new Text("PCT: ").setFont(boldFont));
            String woNum = request.getWorkOrder() != null ? request.getWorkOrder().getOrderNumber() : "";
            p3.add(new Text(woNum.isEmpty() ? ".................................................." : woNum).setFont(normalFont));
            document.add(p3);

            // Tại kho
            Paragraph p4 = new Paragraph().setFont(normalFont).setFontSize(10).setMarginBottom(8);
            p4.add(new Text("Tại kho: ").setFont(boldFont));
            p4.add(new Text("........................................................................................................................").setFont(normalFont));
            document.add(p4);

            Paragraph p5 = new Paragraph("Đề nghị cấp số vật tư dưới đây:")
                    .setFont(normalFont)
                    .setFontSize(10)
                    .setMarginBottom(6);
            document.add(p5);

            // ── Items Table ──────────────────────────────────────────────────
            Table itemsTable = new Table(UnitValue.createPercentArray(new float[] { 8, 15, 37, 10, 10, 10, 10 }))
                    .setWidth(UnitValue.createPercentValue(100));

            // Row 1 Header
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("STT").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Mã vật tư").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Tên, nhãn hiệu, quy cách vật tư").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("ĐVT").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(1, 2).add(new Paragraph("Số lượng").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell(2, 1).add(new Paragraph("Ghi chú").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));

            // Row 2 Header
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Yêu cầu").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Thực cấp").setFont(boldFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE));

            int index = 1;
            for (ConsumableRequestItem item : request.getItems()) {
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getCode() != null ? item.getConsumable().getCode() : "").setFont(normalFont).setFontSize(9)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getName() != null ? item.getConsumable().getName() : "").setFont(normalFont).setFontSize(9)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getUnit() != null ? item.getConsumable().getUnit() : "").setFont(normalFont).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
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
            log.error("Lỗi xuất PDF phiếu cấp vật tư", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
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

    private String generateReqNumber() {
        String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy-MM-dd"));
        long next = 1;
        String candidate;
        do {
            candidate = String.format("YCVT-%s-%04d", datePrefix, next);
            next++;
        } while (consumableRequestRepository.existsByReqNumber(candidate));
        return candidate;
    }

    private ConsumableRequestResponse toResponse(ConsumableRequest r) {
        if (r == null) return null;

        List<ConsumableRequestItemResponse> items = r.getItems().stream()
                .map(item -> ConsumableRequestItemResponse.builder()
                        .itemId(item.getItemId())
                        .consumableId(item.getConsumable().getConsumableId())
                        .code(item.getConsumable().getCode())
                        .name(item.getConsumable().getName())
                        .unit(item.getConsumable().getUnit())
                        .quantityRequested(item.getQuantityRequested())
                        .quantityIssued(item.getQuantityIssued())
                        .build())
                .toList();

        return ConsumableRequestResponse.builder()
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
            candidate = String.format("XKTH-%s-%04d", datePrefix, next);
            next++;
        } while (consumableExportRepository.existsByExportNumber(candidate));
        return candidate;
    }

    private String translateStatus(String status) {
        if (status == null) return "";
        return switch (status.toLowerCase()) {
            case "pending" -> "Chờ cấp phát";
            case "issued" -> "Đã cấp phát";
            case "completed" -> "Hoàn tất";
            case "rejected" -> "Từ chối";
            case "cancelled" -> "Đã hủy";
            default -> status;
        };
    }

    /**
     * Lấy danh sách thông báo chưa đọc.
     */
    public java.util.List<java.util.Map<String, Object>> getUnreadNotifications(String username) {
        return consumableRequestRepository.findUnreadNotifications(username).stream()
                .map(r -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("reqId", r.getReqId());
                    map.put("reqNumber", r.getReqNumber());
                    map.put("status", r.getStatus());
                    map.put("type", "consumable");
                    map.put("reason", r.getNote());
                    map.put("createdByUsername", r.getCreatedBy() != null ? r.getCreatedBy().getUsername() : null);
                    map.put("issuedByName", r.getIssuedBy() != null && r.getIssuedBy().getEmployee() != null 
                        ? r.getIssuedBy().getEmployee().getName() : (r.getIssuedBy() != null ? r.getIssuedBy().getUsername() : null));
                    map.put("timestamp", r.getIssuedAt() != null ? r.getIssuedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 
                        (r.getCreatedAt() != null ? r.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis()));
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Đánh dấu đã đọc.
     */
    @Transactional
    public void markAsRead(UUID reqId, String username) {
        ConsumableRequest request = consumableRequestRepository.findById(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (request.getCreatedBy() != null && request.getCreatedBy().getUsername().equals(username)) {
            request.setIsRead(true);
            consumableRequestRepository.save(request);
        }
    }
}
