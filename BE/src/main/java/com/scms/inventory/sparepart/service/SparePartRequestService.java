package com.scms.inventory.sparepart.service;

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
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.AppException;
import com.scms.common.exception.ErrorCode;
import com.scms.inventory.sparepart.dto.request.CreateSparePartRequestDto;
import com.scms.inventory.sparepart.dto.response.SparePartRequestItemResponse;
import com.scms.inventory.sparepart.dto.response.SparePartRequestResponse;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.entity.SparePartRequest;
import com.scms.inventory.sparepart.entity.SparePartRequestItem;
import com.scms.inventory.sparepart.repository.SparePartRepository;
import com.scms.inventory.sparepart.repository.SparePartRequestItemRepository;
import com.scms.inventory.sparepart.repository.SparePartRequestRepository;
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

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SparePartRequestService {

    SparePartRequestRepository sparePartRequestRepository;
    SparePartRequestItemRepository sparePartRequestItemRepository;
    WorkOrderRepository workOrderRepository;
    SparePartRepository sparePartRepository;
    UserRepository userRepository;

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
    public Page<SparePartRequestResponse> getRequests(String reqNumber, String orderNumber, Pageable pageable) {
        return sparePartRequestRepository.findByFilters(reqNumber, orderNumber, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SparePartRequestResponse getRequestById(UUID reqId) {
        SparePartRequest request = sparePartRequestRepository.findByIdWithDetails(reqId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
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
            addInfoRow(infoTable, normalFont, boldFont, "Trạng thái phiếu:", request.getStatus());
            document.add(infoTable);

            // Table of items
            Paragraph itemsTitle = new Paragraph("DANH SÁCH VẬT TƯ THAY THẾ YÊU CẦU")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setMarginBottom(8);
            document.add(itemsTitle);

            Table itemsTable = new Table(UnitValue.createPercentArray(new float[] { 10, 20, 40, 15, 15 }))
                    .setWidth(UnitValue.createPercentValue(100));

            // Header row
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("STT").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Mã phụ tùng").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Tên phụ tùng").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("Đơn vị").setFont(boldFont).setFontSize(10)));
            itemsTable.addHeaderCell(new Cell().add(new Paragraph("SL yêu cầu").setFont(boldFont).setFontSize(10)));

            int index = 1;
            for (SparePartRequestItem item : request.getItems()) {
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getCode()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getName()).setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(item.getSparePart().getUnit() != null ? item.getSparePart().getUnit() : "").setFont(normalFont).setFontSize(10)));
                itemsTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantityRequested())).setFont(normalFont).setFontSize(10)));
            }

            document.add(itemsTable);

            // Signatures block
            Table signTable = new Table(UnitValue.createPercentArray(new float[] { 33, 34, 33 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(30);

            Cell requesterCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("NGƯỜI YÊU CẦU").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));
            
            Cell managerCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("TỔ TRƯỞNG DUYỆT").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));

            Cell issuerCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph("KHO CẤP PHÁT").setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n\n(Ký và ghi họ tên)").setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));

            signTable.addCell(requesterCell);
            signTable.addCell(managerCell);
            signTable.addCell(issuerCell);
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
        long count = sparePartRequestRepository.count();
        long next = count + 1;
        String candidate;
        do {
            candidate = String.format("YC-VTT-%04d", next);
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
                .items(items)
                .build();
    }
}
