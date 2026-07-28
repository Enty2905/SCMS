package com.scms.common.pdf;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

import java.io.IOException;
import java.io.InputStream;

public final class PdfFontProvider {

    private static final String REGULAR_FONT = "/fonts/NotoSans-Regular.ttf";
    private static final String BOLD_FONT = "/fonts/NotoSans-Bold.ttf";

    private PdfFontProvider() {
    }

    public static FontSet createVietnameseFonts() {
        return new FontSet(createEmbeddedFont(REGULAR_FONT), createEmbeddedFont(BOLD_FONT));
    }

    private static PdfFont createEmbeddedFont(String resourcePath) {
        try (InputStream input = PdfFontProvider.class.getResourceAsStream(resourcePath)) {
            if (input == null) {
                throw new IllegalStateException("PDF font resource not found: " + resourcePath);
            }

            return PdfFontFactory.createFont(
                    input.readAllBytes(),
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED);
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot load PDF font resource: " + resourcePath, exception);
        }
    }

    public record FontSet(PdfFont normal, PdfFont bold) {
    }
}
