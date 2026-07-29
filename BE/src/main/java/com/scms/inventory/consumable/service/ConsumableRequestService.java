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
    ConsumableExportItemRepository consumableExportItemRepository;
    ConsumableExportRepository consumableExportRepository;
    ConsumableRequestItemRepository consumableRequestItemRepository;
    ConsumableStockRepository consumableStockRepository;
    CloudinaryService cloudinaryService;
    NotificationService notificationService;

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
        return toResponse(request);
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
            document.setMargins(40, 50, 40, 50);

            PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
            PdfFont normalFont = fonts.normal();
            PdfFont boldFont = fonts.bold();

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            // Header/Title
            Paragraph title = new Paragraph("PHIẾU CẤP VẬT TƯ TIÊU HAO")
                    .setFont(boldFont)
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(title);

            // Information details
            Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 35, 65 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(15);

            addInfoRow(infoTable, normalFont, boldFont, "Số phiếu yêu cầu:", request.getReqNumber());
            addInfoRow(infoTable, normalFont, boldFont, "Ngày lập:", request.getCreatedAt().format(dtf));
            addInfoRow(infoTable, normalFont, boldFont, "Người lập:",
                    request.getCreatedBy() != null && request.getCreatedBy().getEmployee() != null
                            ? request.getCreatedBy().getEmployee().getName()
                            : (request.getCreatedBy() != null ? request.getCreatedBy().getUsername() : ""));
            addInfoRow(infoTable, normalFont, boldFont, "Phiếu công tác liên quan:",
                    request.getWorkOrder() != null ? request.getWorkOrder().getOrderNumber() : "Không liên kết");
            addInfoRow(infoTable, normalFont, boldFont, "Trạng thái phiếu:", translateStatus(request.getStatus()));
            document.add(infoTable);

            // Table of items
            Paragraph itemsTitle = new Paragraph("DANH SÁCH VẬT TƯ TIÊU HAO CẤP PHÁT")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setMarginBottom(8);
            document.add(itemsTitle);

            Table itemsTable = new Table(UnitValue.createPercentArray(new float[] { 8, 18, 34, 12, 14, 14 }))
                    .setWidth(UnitValue.createPercentValue(100));

            // Header row
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("STT").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Mã vật tư").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Tên vật tư").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Đơn vị").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("SL yêu cầu").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("SL thực cấp").setFont(boldFont).setFontSize(10)));

            int index = 1;
            for (ConsumableRequestItem item : request.getItems()) {
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getCode()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getName()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getConsumable().getUnit() != null ? item.getConsumable().getUnit() : "").setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantityRequested())).setFont(normalFont).setFontSize(10)));
                String issuedText = (!"pending".equalsIgnoreCase(request.getStatus()) && item.getQuantityIssued() != null)
                        ? String.valueOf(item.getQuantityIssued()) : ".....";
                itemsTable.addCell(new Cell().add(new Paragraph(issuedText).setFont(normalFont).setFontSize(10)));
            }

            document.add(itemsTable);

            // Signatures block
            Table signTable = new Table(UnitValue.createPercentArray(new float[] { 33, 34, 33 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(30);

            Cell requesterCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("NGƯỜI YÊU CẦU").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));

            Cell issuerCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("NGƯỜI CẤP PHÁT").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));

            Cell receiverCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("NGƯỜI NHẬN").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));

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
}
