package com.scms.common.pdf;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfFontProviderTest {

    private static final String VIETNAMESE_TEXT =
            "Phiếu công tác - Người chỉ huy - Đánh giá kỹ thuật";

    @Test
    void embeddedFontsPreserveVietnameseText() throws Exception {
        byte[] pdfBytes;

        try (ByteArrayOutputStream output = new ByteArrayOutputStream();
             PdfDocument pdf = new PdfDocument(new PdfWriter(output));
             Document document = new Document(pdf)) {
            PdfFontProvider.FontSet fonts = PdfFontProvider.createVietnameseFonts();
            document.add(new Paragraph(VIETNAMESE_TEXT).setFont(fonts.normal()));
            document.add(new Paragraph(VIETNAMESE_TEXT).setFont(fonts.bold()));
            document.close();
            pdfBytes = output.toByteArray();
        }

        try (PdfDocument pdf = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)))) {
            String extractedText = PdfTextExtractor.getTextFromPage(pdf.getFirstPage());
            assertTrue(extractedText.contains(VIETNAMESE_TEXT));
        }
    }
}
