package com.scms.equipment.service;

import com.scms.equipment.dto.response.EquipmentResponse;
import com.scms.equipment.entity.EquipmentSystem;
import com.scms.equipment.repository.EquipmentSystemRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentExcelService {

    private final EquipmentSystemRepository equipmentSystemRepository;

    public byte[] exportToExcel(List<EquipmentResponse> equipments) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Danh sách thiết bị");
            sheet.setDisplayGridlines(true);

            // Configure column widths for 4-column layout
            sheet.setColumnWidth(0, 3500); // STT / Left half of image
            sheet.setColumnWidth(1, 5000); // Name / Right half of image
            sheet.setColumnWidth(2, 4000); // Value / Parameter label
            sheet.setColumnWidth(3, 4500); // Unit / Parameter value

            // Create styles
            Font titleFont = workbook.createFont();
            titleFont.setFontName("Arial");
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setBold(true);

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.LEFT);

            Font blockTitleFont = workbook.createFont();
            blockTitleFont.setFontName("Arial");
            blockTitleFont.setFontHeightInPoints((short) 11);
            blockTitleFont.setBold(true);
            blockTitleFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFCellStyle blockTitleStyle = (XSSFCellStyle) workbook.createCellStyle();
            blockTitleStyle.setFont(blockTitleFont);
            blockTitleStyle.setAlignment(HorizontalAlignment.LEFT);
            blockTitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            byte[] titleBannerColor = new byte[]{(byte) 30, (byte) 41, (byte) 59}; // Slate (#1E293B)
            blockTitleStyle.setFillForegroundColor(new XSSFColor(titleBannerColor, null));
            blockTitleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(blockTitleStyle, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());

            Font sectionFont = workbook.createFont();
            sectionFont.setFontName("Arial");
            sectionFont.setFontHeightInPoints((short) 11);
            sectionFont.setBold(true);

            CellStyle sectionStyle = workbook.createCellStyle();
            sectionStyle.setFont(sectionFont);
            sectionStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(sectionStyle, BorderStyle.THIN, IndexedColors.GREY_50_PERCENT.getIndex());

            Font labelFont = workbook.createFont();
            labelFont.setFontName("Arial");
            labelFont.setFontHeightInPoints((short) 10);
            labelFont.setBold(true);

            CellStyle labelStyle = workbook.createCellStyle();
            labelStyle.setFont(labelFont);
            labelStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(labelStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            Font valueFont = workbook.createFont();
            valueFont.setFontName("Arial");
            valueFont.setFontHeightInPoints((short) 10);

            CellStyle valueStyle = workbook.createCellStyle();
            valueStyle.setFont(valueFont);
            valueStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(valueStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            Font headerFont = workbook.createFont();
            headerFont.setFontName("Arial");
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFCellStyle headerStyle = (XSSFCellStyle) workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            byte[] indigoColor = new byte[]{(byte) 79, (byte) 70, (byte) 229};
            headerStyle.setFillForegroundColor(new XSSFColor(indigoColor, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(headerStyle, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());

            CellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setFont(valueFont);
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            centerDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(centerDataStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            CellStyle imageBoxStyle = workbook.createCellStyle();
            imageBoxStyle.setAlignment(HorizontalAlignment.CENTER);
            imageBoxStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            imageBoxStyle.setFont(valueFont);
            setBorder(imageBoxStyle, BorderStyle.DASHED, IndexedColors.GREY_40_PERCENT.getIndex());

            // Main Title
            Row r0 = sheet.createRow(0);
            Cell titleCell = r0.createCell(0);
            titleCell.setCellValue("DANH SÁCH CHI TIẾT CÁC THIẾT BỊ");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));
            r0.setHeightInPoints(25);

            int currentRow = 2;
            for (int index = 0; index < equipments.size(); index++) {
                EquipmentResponse eq = equipments.get(index);
                currentRow = drawEquipmentBlock(sheet, eq, currentRow, workbook,
                        blockTitleStyle, sectionStyle, labelStyle, valueStyle,
                        headerStyle, centerDataStyle, imageBoxStyle);
                // Leave 3 blank rows spacing
                currentRow += 3;
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi sinh file Excel danh sách thiết bị", e);
        }
    }

    public byte[] exportSingleToExcel(EquipmentResponse eq) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Chi tiết thiết bị");
            sheet.setDisplayGridlines(true);

            // Configure column widths for 4-column layout
            sheet.setColumnWidth(0, 3500); // STT / Left half of image
            sheet.setColumnWidth(1, 5000); // Name / Right half of image
            sheet.setColumnWidth(2, 4000); // Value / Parameter label
            sheet.setColumnWidth(3, 4500); // Unit / Parameter value

            // Create styles
            Font titleFont = workbook.createFont();
            titleFont.setFontName("Arial");
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setBold(true);

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.LEFT);

            Font blockTitleFont = workbook.createFont();
            blockTitleFont.setFontName("Arial");
            blockTitleFont.setFontHeightInPoints((short) 11);
            blockTitleFont.setBold(true);
            blockTitleFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFCellStyle blockTitleStyle = (XSSFCellStyle) workbook.createCellStyle();
            blockTitleStyle.setFont(blockTitleFont);
            blockTitleStyle.setAlignment(HorizontalAlignment.LEFT);
            blockTitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            byte[] titleBannerColor = new byte[]{(byte) 30, (byte) 41, (byte) 59}; // Slate (#1E293B)
            blockTitleStyle.setFillForegroundColor(new XSSFColor(titleBannerColor, null));
            blockTitleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(blockTitleStyle, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());

            Font sectionFont = workbook.createFont();
            sectionFont.setFontName("Arial");
            sectionFont.setFontHeightInPoints((short) 11);
            sectionFont.setBold(true);

            CellStyle sectionStyle = workbook.createCellStyle();
            sectionStyle.setFont(sectionFont);
            sectionStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(sectionStyle, BorderStyle.THIN, IndexedColors.GREY_50_PERCENT.getIndex());

            Font labelFont = workbook.createFont();
            labelFont.setFontName("Arial");
            labelFont.setFontHeightInPoints((short) 10);
            labelFont.setBold(true);

            CellStyle labelStyle = workbook.createCellStyle();
            labelStyle.setFont(labelFont);
            labelStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(labelStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            Font valueFont = workbook.createFont();
            valueFont.setFontName("Arial");
            valueFont.setFontHeightInPoints((short) 10);

            CellStyle valueStyle = workbook.createCellStyle();
            valueStyle.setFont(valueFont);
            valueStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(valueStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            Font headerFont = workbook.createFont();
            headerFont.setFontName("Arial");
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFCellStyle headerStyle = (XSSFCellStyle) workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            byte[] indigoColor = new byte[]{(byte) 79, (byte) 70, (byte) 229};
            headerStyle.setFillForegroundColor(new XSSFColor(indigoColor, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(headerStyle, BorderStyle.THIN, IndexedColors.GREY_40_PERCENT.getIndex());

            CellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setFont(valueFont);
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            centerDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorder(centerDataStyle, BorderStyle.THIN, IndexedColors.GREY_25_PERCENT.getIndex());

            CellStyle imageBoxStyle = workbook.createCellStyle();
            imageBoxStyle.setAlignment(HorizontalAlignment.CENTER);
            imageBoxStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            imageBoxStyle.setFont(valueFont);
            setBorder(imageBoxStyle, BorderStyle.DASHED, IndexedColors.GREY_40_PERCENT.getIndex());

            // Title Row
            Row row0 = sheet.createRow(0);
            Cell titleCell = row0.createCell(0);
            titleCell.setCellValue("THÔNG TIN CHI TIẾT THIẾT BỊ");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));
            row0.setHeightInPoints(25);

            // Draw block starting at Row 2
            drawEquipmentBlock(sheet, eq, 2, workbook,
                    blockTitleStyle, sectionStyle, labelStyle, valueStyle,
                    headerStyle, centerDataStyle, imageBoxStyle);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi xuất Excel chi tiết thiết bị", e);
        }
    }

    private int drawEquipmentBlock(Sheet sheet, EquipmentResponse eq, int startRow, Workbook workbook,
                                   CellStyle titleBlockStyle, CellStyle sectionStyle, CellStyle labelStyle,
                                   CellStyle valueStyle, CellStyle headerStyle, CellStyle centerDataStyle,
                                   CellStyle imageBoxStyle) {
        String systemName = "N/A";
        if (eq.getSystemId() != null) {
            var sysOpt = equipmentSystemRepository.findById(eq.getSystemId());
            if (sysOpt.isPresent()) {
                systemName = sysOpt.get().getSystemName();
            }
        }

        // Row 0: Slate Banner header with Equipment info
        Row rTitle = sheet.createRow(startRow);
        rTitle.setHeightInPoints(24);
        Cell titleCell = rTitle.createCell(0);
        titleCell.setCellValue("THIẾT BỊ: " + (eq.getKksCode() != null ? eq.getKksCode() : "") + " - " + (eq.getEquipmentName() != null ? eq.getEquipmentName() : ""));
        titleCell.setCellStyle(titleBlockStyle);
        
        // Ensure styling applies across merged range
        for (int c = 1; c <= 3; c++) {
            rTitle.createCell(c).setCellStyle(titleBlockStyle);
        }
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(startRow, startRow, 0, 3));

        // Row 1: Section 1 Header
        Row rSec1 = sheet.createRow(startRow + 1);
        rSec1.setHeightInPoints(20);
        Cell sec1Cell = rSec1.createCell(0);
        sec1Cell.setCellValue(" 1. THÔNG TIN CHUNG & HÌNH ẢNH");
        sec1Cell.setCellStyle(sectionStyle);
        
        for (int c = 1; c <= 3; c++) {
            rSec1.createCell(c).setCellStyle(sectionStyle);
        }
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(startRow + 1, startRow + 1, 0, 3));

        // Rows 2-7: Image Placeholder box (A:B merged)
        for (int r = startRow + 2; r <= startRow + 7; r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            Cell c0 = row.createCell(0);
            c0.setCellStyle(imageBoxStyle);
            Cell c1 = row.createCell(1);
            c1.setCellStyle(imageBoxStyle);
        }
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(startRow + 2, startRow + 7, 0, 1));
        sheet.getRow(startRow + 2).getCell(0).setCellValue("Chưa có hình ảnh thiết bị");

        // Metadata details on Col C (label) and Col D (value)
        String[] labels = {
                "Mã định danh KKS:",
                "Tên thiết bị:",
                "Phân loại:",
                "Trạng thái:",
                "Hệ thống quản lý:",
                "Vị trí lắp đặt:"
        };
        String[] values = {
                eq.getKksCode() != null ? eq.getKksCode() : "",
                eq.getEquipmentName() != null ? eq.getEquipmentName() : "",
                eq.getEquipmentType() != null ? eq.getEquipmentType() : "",
                eq.getStatus() != null ? eq.getStatus() : "",
                systemName,
                eq.getLocation() != null ? eq.getLocation() : ""
        };

        for (int i = 0; i < 6; i++) {
            Row row = sheet.getRow(startRow + 2 + i);
            row.setHeightInPoints(20);

            Cell cl = row.createCell(2);
            cl.setCellValue(labels[i]);
            cl.setCellStyle(labelStyle);

            Cell cv = row.createCell(3);
            cv.setCellValue(values[i]);
            cv.setCellStyle(valueStyle);
        }

        // Embed image if available
        if (eq.getImages() != null && !eq.getImages().isEmpty()) {
            String imageUrl = eq.getImages().get(0).getImageUrl();
            if (imageUrl != null && !imageUrl.isBlank()) {
                try {
                    byte[] imageBytes = null;
                    int pictureType = -1;

                    if (imageUrl.toLowerCase().endsWith(".png")) {
                        pictureType = Workbook.PICTURE_TYPE_PNG;
                    } else if (imageUrl.toLowerCase().endsWith(".jpg") || imageUrl.toLowerCase().endsWith(".jpeg")) {
                        pictureType = Workbook.PICTURE_TYPE_JPEG;
                    }

                    if (pictureType != -1) {
                        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                            try (java.io.InputStream is = java.net.URI.create(imageUrl).toURL().openStream()) {
                                imageBytes = is.readAllBytes();
                            }
                        } else {
                            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                            java.nio.file.Path path = java.nio.file.Paths.get("uploads/equipment-images").resolve(filename);
                            if (java.nio.file.Files.exists(path)) {
                                imageBytes = java.nio.file.Files.readAllBytes(path);
                            }
                        }

                        if (imageBytes != null && imageBytes.length > 0) {
                            sheet.getRow(startRow + 2).getCell(0).setCellValue("");
                            int pictureIdx = workbook.addPicture(imageBytes, pictureType);
                            CreationHelper helper = workbook.getCreationHelper();
                            Drawing<?> drawing = sheet.createDrawingPatriarch();
                            ClientAnchor anchor = helper.createClientAnchor();

                            // Bind A[startRow+2]:B[startRow+7] (Cols 0-1, Rows startRow+2 to startRow+7)
                            anchor.setCol1(0);
                            anchor.setRow1(startRow + 2);
                            anchor.setCol2(2); // Exclusive
                            anchor.setRow2(startRow + 8); // Exclusive

                            drawing.createPicture(anchor, pictureIdx);
                        }
                    }
                } catch (Exception ex) {
                    sheet.getRow(startRow + 2).getCell(0).setCellValue("Lỗi tải hình ảnh");
                }
            }
        }

        // Row startRow + 8: Section 2 Header
        Row rSec2 = sheet.createRow(startRow + 8);
        rSec2.setHeightInPoints(20);
        Cell sec2Cell = rSec2.createCell(0);
        sec2Cell.setCellValue(" 2. THÔNG SỐ KỸ THUẬT VẬN HÀNH CHI TIẾT");
        sec2Cell.setCellStyle(sectionStyle);
        for (int c = 1; c <= 3; c++) {
            rSec2.createCell(c).setCellStyle(sectionStyle);
        }
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(startRow + 8, startRow + 8, 0, 3));

        // Row startRow + 9: Table Header
        Row specHeader = sheet.createRow(startRow + 9);
        specHeader.setHeightInPoints(22);
        String[] specHeaders = {"STT", "Tên tham số kỹ thuật", "Giá trị vận hành", "Đơn vị"};
        for (int i = 0; i < specHeaders.length; i++) {
            Cell cell = specHeader.createCell(i);
            cell.setCellValue(specHeaders[i]);
            cell.setCellStyle(headerStyle);
        }

        int currentDrawRow = startRow + 10;
        if (eq.getSpecs() != null && !eq.getSpecs().isEmpty()) {
            for (int i = 0; i < eq.getSpecs().size(); i++) {
                var spec = eq.getSpecs().get(i);
                Row row = sheet.createRow(currentDrawRow++);
                row.setHeightInPoints(20);

                Cell c0 = row.createCell(0);
                c0.setCellValue(i + 1);
                c0.setCellStyle(centerDataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(spec.getParamName() != null ? spec.getParamName() : "");
                c1.setCellStyle(valueStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(spec.getParamValue() != null ? spec.getParamValue() : "");
                c2.setCellStyle(centerDataStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(spec.getUnitSymbol() != null ? spec.getUnitSymbol() : "");
                c3.setCellStyle(centerDataStyle);
            }
        } else {
            Row row = sheet.createRow(currentDrawRow++);
            row.setHeightInPoints(20);
            for (int c = 0; c <= 3; c++) {
                row.createCell(c).setCellStyle(valueStyle);
            }
            row.getCell(0).setCellValue("Thiết bị này chưa được cấu hình thông số kỹ thuật vận hành.");
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(currentDrawRow - 1, currentDrawRow - 1, 0, 3));
        }

        return currentDrawRow;
    }

    private void setBorder(CellStyle style, BorderStyle border, short color) {
        style.setBorderTop(border);
        style.setTopBorderColor(color);
        style.setBorderBottom(border);
        style.setBottomBorderColor(color);
        style.setBorderLeft(border);
        style.setLeftBorderColor(color);
        style.setBorderRight(border);
        style.setRightBorderColor(color);
    }
}
