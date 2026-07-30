package com.scms.inventory.consumable.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.scms.auth.entity.User;
import com.scms.department.entity.Department;
import com.scms.employee.entity.Employee;
import com.scms.inventory.consumable.entity.Consumable;
import com.scms.inventory.consumable.entity.ConsumableRequest;
import com.scms.inventory.consumable.entity.ConsumableRequestItem;
import com.scms.inventory.consumable.repository.ConsumableRequestRepository;
import com.scms.maintenance.workorder.entity.WorkOrder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsumableRequestServiceTest {

    @Mock
    ConsumableRequestRepository consumableRequestRepository;

    @InjectMocks
    ConsumableRequestService consumableRequestService;

    @Test
    void exportPdfGeneratesCorrectLayout() throws Exception {
        UUID reqId = UUID.randomUUID();

        Department dept = Department.builder()
                .departmentId(UUID.randomUUID())
                .departmentName("Cơ Nhiệt")
                .build();

        Employee employee = Employee.builder()
                .employeeId(UUID.randomUUID())
                .name("Nguyễn Ngọc Hoàng")
                .department(dept)
                .build();

        User user = User.builder()
                .userId(UUID.randomUUID())
                .username("hoangnn")
                .employee(employee)
                .build();

        WorkOrder wo = WorkOrder.builder()
                .orderId(UUID.randomUUID())
                .orderNumber("WO 304230")
                .build();

        Consumable consumable = Consumable.builder()
                .consumableId(UUID.randomUUID())
                .code("89110001")
                .name("Vải lau màu")
                .unit("Kg")
                .build();

        ConsumableRequestItem item = ConsumableRequestItem.builder()
                .itemId(UUID.randomUUID())
                .consumable(consumable)
                .quantityRequested(3)
                .quantityIssued(3)
                .build();

        ConsumableRequest request = ConsumableRequest.builder()
                .reqId(reqId)
                .reqNumber("YCVT-26-08-05-0001")
                .workOrder(wo)
                .status("approved")
                .createdBy(user)
                .createdAt(LocalDateTime.of(2016, 8, 5, 10, 0))
                .note("Kiểm tra và khắc phục bơm tổng xỉ 2A")
                .items(Collections.singletonList(item))
                .build();

        // Inject companyRequest property
        ReflectionTestUtils.setField(consumableRequestService, "companyRequest", "CÔNG TY SCSM");

        when(consumableRequestRepository.findByIdWithDetails(reqId)).thenReturn(Optional.of(request));

        byte[] pdfBytes = consumableRequestService.exportPdf(reqId);

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

            assertTrue(extractedText.contains("CÔNG TY SCSM"));
            assertFalse(extractedText.contains("CHI NHÁNH HÀ TĨNH"));
            assertTrue(extractedText.contains("Số: YCVT-26-08-05-0001/PX"));
            assertTrue(extractedText.contains("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"));
            assertTrue(extractedText.contains("Độc lập - Tự do - Hạnh phúc"));
            assertTrue(extractedText.contains("Ngày ..... tháng ..... năm ....."));
            assertTrue(extractedText.contains("GIẤY ĐỀ NGHỊ CẤP VẬT TƯ TIÊU HAO"));
            assertTrue(extractedText.contains("Kính gửi: ........................................................................"));
            assertTrue(extractedText.contains("Tên người đề nghị: .................................................."));
            assertTrue(extractedText.contains("Tổ:"));
            assertTrue(extractedText.contains("Phân xưởng: Cơ Nhiệt"));
            assertTrue(extractedText.contains("Lý do sử dụng: Kiểm tra và khắc phục bơm tổng xỉ 2A"));
            assertTrue(extractedText.contains("PCT: WO 304230"));
            assertTrue(extractedText.contains("Tại kho:"));
            assertTrue(extractedText.contains("STT"));
            assertTrue(extractedText.contains("Mã vật tư"));
            assertTrue(extractedText.contains("Tên, nhãn hiệu, quy cách vật tư"));
            assertTrue(extractedText.contains("ĐVT"));
            assertTrue(extractedText.contains("Số lượng"));
            assertTrue(extractedText.contains("Yêu cầu"));
            assertTrue(extractedText.contains("Thực cấp"));
            assertTrue(extractedText.contains("Ghi chú"));
            assertTrue(extractedText.contains("89110001"));
            assertTrue(extractedText.contains("Vải lau màu"));
            assertTrue(extractedText.contains("NGƯỜI YÊU CẦU"));
            assertTrue(extractedText.contains("NGƯỜI CẤP PHÁT"));
            assertTrue(extractedText.contains("NGƯỜI NHẬN"));
            assertTrue(extractedText.contains("(Ký và ghi họ tên)"));
            assertFalse(extractedText.contains("Nguyễn Ngọc Hoàng"));
        }
    }
}
