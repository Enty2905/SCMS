package com.scms.maintenance.assessment.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.scms.employee.entity.Employee;
import com.scms.equipment.entity.Equipment;
import com.scms.equipment.entity.EquipmentSystem;
import com.scms.equipment.repository.EquipmentSystemRepository;
import com.scms.maintenance.assessment.entity.TechnicalAssessment;
import com.scms.maintenance.assessment.repository.TechnicalAssessmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TechnicalAssessmentServiceTest {

    @Mock
    TechnicalAssessmentRepository assessmentRepository;

    @Mock
    EquipmentSystemRepository equipmentSystemRepository;

    @InjectMocks
    TechnicalAssessmentService technicalAssessmentService;

    @Test
    void exportPdfGeneratesCorrectLayout() throws Exception {
        UUID assessmentId = UUID.randomUUID();
        UUID equipmentId = UUID.randomUUID();
        UUID systemId = UUID.randomUUID();

        EquipmentSystem system = EquipmentSystem.builder()
                .systemId(systemId)
                .systemName("Thải tro xỉ")
                .systemCode("TTX")
                .build();

        Equipment eq = Equipment.builder()
                .id(equipmentId)
                .equipmentName("Van đầu vào Collector tank số 1 silo 2")
                .kksCode("00UEU")
                .systemId(systemId)
                .build();

        Employee creator = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name("Trần Văn Chánh")
                .build();

        Employee repairSigner = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name("Nguyễn Văn Chinh")
                .build();

        TechnicalAssessment ta = TechnicalAssessment.builder()
                .assessmentId(assessmentId)
                .assessmentNumber("BBKT-26-07-29-0001")
                .equipment(eq)
                .damageDescription("Lấy trục mới gia công")
                .proposedAction("Tháo trục trả về PVP HT")
                .createdBy(creator)
                .createdAt(LocalDateTime.of(2016, 9, 10, 10, 0))
                .repairSignedBy(repairSigner)
                .build();

        org.springframework.test.util.ReflectionTestUtils.setField(technicalAssessmentService, "companyOwner", "CÔNG TY SCMS");
        org.springframework.test.util.ReflectionTestUtils.setField(technicalAssessmentService, "companyRepair", "CTY CP SCMS");

        when(assessmentRepository.findByIdWithDetails(assessmentId)).thenReturn(Optional.of(ta));
        when(equipmentSystemRepository.findById(systemId)).thenReturn(Optional.of(system));

        byte[] pdfBytes = technicalAssessmentService.exportPdf(assessmentId);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        try (PdfDocument pdf = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)))) {
            StringBuilder sb = new StringBuilder();
            for (int i = 1; i <= pdf.getNumberOfPages(); i++) {
                sb.append(PdfTextExtractor.getTextFromPage(pdf.getPage(i))).append("\n");
            }
            String extractedText = sb.toString();
            System.out.println("--- EXTRACTED TEXT START ---");
            System.out.println(extractedText);
            System.out.println("--- EXTRACTED TEXT END ---");
            System.out.println("Total pages: " + pdf.getNumberOfPages());
            
            // Verify content is in the generated PDF
            assertTrue(extractedText.contains("BIÊN BẢN ĐÁNH GIÁ KỸ THUẬT"));
            assertTrue(extractedText.contains("Số: BBKT-26-07-29-0001/ĐGKT"));
            assertFalse(extractedText.contains("BM4/ĐLDKHT.5")); // Form code should be removed
            assertTrue(extractedText.contains("Van đầu vào Collector tank số 1 silo 2"));
            assertTrue(extractedText.contains("Thải tro xỉ"));
            assertTrue(extractedText.contains("00UEU"));
            assertFalse(extractedText.contains("Trần Văn Chánh")); // Người thực hiện must be left blank
            assertTrue(extractedText.contains("10/09/2016"));
            assertTrue(extractedText.contains("Lấy trục mới gia công"));
            assertTrue(extractedText.contains("Tháo trục trả về PVP HT"));
            assertFalse(extractedText.contains("PETROVIETNAM")); // PETROVIETNAM should be removed
            assertTrue(extractedText.contains("CÔNG TY SCMS"));
            assertTrue(extractedText.contains("CTY CP SCMS"));
            assertTrue(extractedText.contains("Nguyễn Văn Chinh"));
            assertFalse(extractedText.contains("BM-QTPH-PVPHT-PVPSHT")); // Footer should be removed
            assertTrue(extractedText.contains("Phân xưởng (Đơn vị QLTB)"));
            assertTrue(extractedText.contains("Phòng Kỹ thuật Công nghệ"));
            assertTrue(extractedText.contains("Người kiểm tra"));
            assertTrue(extractedText.contains("(Ký và ghi rõ họ tên)"));
        }
    }
}
