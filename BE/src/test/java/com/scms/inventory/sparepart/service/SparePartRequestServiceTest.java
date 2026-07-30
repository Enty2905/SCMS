package com.scms.inventory.sparepart.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.scms.auth.entity.User;
import com.scms.department.entity.Department;
import com.scms.employee.entity.Employee;
import com.scms.equipment.entity.Equipment;
import com.scms.inventory.sparepart.entity.SparePart;
import com.scms.inventory.sparepart.entity.SparePartRequest;
import com.scms.inventory.sparepart.entity.SparePartRequestItem;
import com.scms.inventory.sparepart.repository.SparePartRequestRepository;
import com.scms.maintenance.workorder.entity.WorkOrder;
import com.scms.repairrequest.entity.RepairRequest;
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
class SparePartRequestServiceTest {

    @Mock
    SparePartRequestRepository sparePartRequestRepository;

    @InjectMocks
    SparePartRequestService sparePartRequestService;

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

        Equipment eq = Equipment.builder()
                .id(UUID.randomUUID())
                .equipmentName("Van đầu vào")
                .kksCode("10SMG03AF001")
                .build();

        RepairRequest rr = RepairRequest.builder()
                .requestId(UUID.randomUUID())
                .equipment(eq)
                .build();

        WorkOrder wo = WorkOrder.builder()
                .orderId(UUID.randomUUID())
                .orderNumber("254066")
                .request(rr)
                .build();

        SparePart sparePart = SparePart.builder()
                .sparePartId(UUID.randomUUID())
                .code("48911428")
                .name("Vỏ gối đỡ SNL-512-610")
                .unit("Bộ")
                .build();

        SparePartRequestItem item = SparePartRequestItem.builder()
                .itemId(UUID.randomUUID())
                .sparePart(sparePart)
                .quantityRequested(3)
                .quantityIssued(3)
                .build();

        SparePartRequest request = SparePartRequest.builder()
                .reqId(reqId)
                .reqNumber("YCVTT-26-08-05-0001")
                .workOrder(wo)
                .status("approved")
                .createdBy(user)
                .createdAt(LocalDateTime.of(2015, 12, 21, 10, 0))
                .note("Thay vỏ gối mới cho vỏ gối cũ")
                .items(Collections.singletonList(item))
                .build();

        // Inject companyRequest property
        ReflectionTestUtils.setField(sparePartRequestService, "companyRequest", "CÔNG TY SCSM");

        when(sparePartRequestRepository.findByIdWithDetails(reqId)).thenReturn(Optional.of(request));

        byte[] pdfBytes = sparePartRequestService.exportPdf(reqId);

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
            assertTrue(extractedText.contains("Số: YCVTT-26-08-05-0001/PX"));
            assertTrue(extractedText.contains("Biểu số 03-TT"));
            assertTrue(extractedText.contains("Ban hành theo quyết định số 15/2006/QĐ-BTC"));
            assertTrue(extractedText.contains("GIẤY ĐỀ NGHỊ XUẤT KHO VẬT TƯ"));
            assertTrue(extractedText.contains("Ngày ..... tháng ..... năm ....."));
            assertTrue(extractedText.contains("Xuất tại kho:"));
            assertTrue(extractedText.contains("Số phiếu xuất:"));
            assertTrue(extractedText.contains("Ngày:"));
            assertTrue(extractedText.contains("Kính gửi: ........................................................................"));
            assertTrue(extractedText.contains("1. Người đề nghị: .................................................."));
            assertTrue(extractedText.contains("2. Lý do sử dụng: Thay vỏ gối mới cho vỏ gối cũ"));
            assertTrue(extractedText.contains("WO: 254066"));
            assertTrue(extractedText.contains("KKS: 10SMG03AF001"));
            assertTrue(extractedText.contains("3. Đề nghị lĩnh số vật tư dưới đây:"));
            assertTrue(extractedText.contains("STT"));
            assertTrue(extractedText.contains("Mã vật tư"));
            assertTrue(extractedText.contains("Tên vật tư và quy cách"));
            assertTrue(extractedText.contains("ĐVT"));
            assertTrue(extractedText.contains("Số lượng"));
            assertTrue(extractedText.contains("Cần"));
            assertTrue(extractedText.contains("Cấp"));
            assertTrue(extractedText.contains("Ghi chú"));
            assertTrue(extractedText.contains("48911428"));
            assertTrue(extractedText.contains("Vỏ gối đỡ SNL-512-610"));
            assertTrue(extractedText.contains("NGƯỜI YÊU CẦU"));
            assertTrue(extractedText.contains("NGƯỜI CẤP PHÁT"));
            assertTrue(extractedText.contains("NGƯỜI NHẬN"));
            assertTrue(extractedText.contains("(Ký và ghi họ tên)"));
            assertFalse(extractedText.contains("Nguyễn Ngọc Hoàng"));
        }
    }
}
