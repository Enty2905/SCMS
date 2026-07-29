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
import com.scms.common.service.NotificationService;
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
    NotificationService notificationService;

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

        SparePartRequestResponse response = toResponse(request);
        notificationService.sendMaterialRequestNotification(response);
        return response;
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
            document.setMargins(40, 50, 40, 50);

            PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
            PdfFont normalFont = fonts.normal();
            PdfFont boldFont = fonts.bold();

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            // Header/Title
            Paragraph title = new Paragraph("PHIẾU CẤP VẬT TƯ THAY THẾ")
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
            Paragraph itemsTitle = new Paragraph("DANH SÁCH VẬT TƯ THAY THẾ CẤP PHÁT")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setMarginBottom(8);
            document.add(itemsTitle);

            Table itemsTable = new Table(UnitValue.createPercentArray(new float[] { 8, 18, 34, 12, 14, 14 }))
                    .setWidth(UnitValue.createPercentValue(100));

            // Header row
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("STT").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Mã phụ tùng").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Tên phụ tùng").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Đơn vị").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("SL yêu cầu").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("SL thực cấp").setFont(boldFont).setFontSize(10)));

            int index = 1;
            for (SparePartRequestItem item : request.getItems()) {
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getCode()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getName()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getUnit() != null ? item.getSparePart().getUnit() : "").setFont(normalFont).setFontSize(10)));
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
            log.error("Lỗi xuất PDF phiếu cấp phụ tùng", e);
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
