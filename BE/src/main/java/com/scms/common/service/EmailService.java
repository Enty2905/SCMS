package com.scms.common.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${app.name}")
    private String appName;

    public void sendToolBorrowOverdueEmail(String to, String employeeName, String toolName, int quantity,
                                           LocalDateTime borrowDate, LocalDateTime dueDate, long overdueDays) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[" + appName + "] Thông báo quá hạn trả CCDC");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String borrowDateStr = borrowDate != null ? borrowDate.format(formatter) : "";
            String dueDateStr = dueDate != null ? dueDate.format(formatter) : "";

            String htmlContent = String.format("""
                    <html>
                    <body>
                        <h2>Thông báo quá hạn trả CCDC</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Hệ thống ghi nhận bạn đang có phiếu mượn Công cụ dụng cụ (CCDC) đã quá hạn. Chi tiết như sau:</p>
                        <ul>
                            <li><strong>Tên CCDC:</strong> %s</li>
                            <li><strong>Số lượng:</strong> %d</li>
                            <li><strong>Ngày mượn:</strong> %s</li>
                            <li><strong>Hạn trả:</strong> %s</li>
                            <li><strong style="color: red;">Số ngày quá hạn:</strong> %d ngày</li>
                        </ul>
                        <p><strong>Yêu cầu:</strong> Vui lòng liên hệ thủ kho CCDC để hoàn trả trong thời gian sớm nhất.</p>
                        <p>Trân trọng,<br>Hệ thống %s</p>
                    </body>
                    </html>
                    """, employeeName, toolName, quantity, borrowDateStr, dueDateStr, overdueDays, appName);

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("[EmailService] Đã gửi email nhắc trả CCDC thành công tới {}", to);

        } catch (MessagingException e) {
            log.error("[EmailService] Lỗi khi gửi email tới {}: {}", to, e.getMessage());
            throw new RuntimeException("Gửi email thất bại", e);
        }
    }

    public record OverdueToolInfo(String toolName, int quantity, LocalDateTime borrowDate, LocalDateTime dueDate, long overdueDays) {}

    public void sendToolBorrowOverdueEmailMulti(String to, String employeeName, java.util.List<OverdueToolInfo> items) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[" + appName + "] Thông báo quá hạn trả CCDC (" + items.size() + " mục)");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            StringBuilder itemsHtml = new StringBuilder();
            for (int i = 0; i < items.size(); i++) {
                OverdueToolInfo item = items.get(i);
                String borrowDateStr = item.borrowDate() != null ? item.borrowDate().format(formatter) : "";
                String dueDateStr = item.dueDate() != null ? item.dueDate().format(formatter) : "";
                itemsHtml.append(String.format("""
                            <li style="margin-bottom: 10px;">
                                <strong>%d. %s</strong> (SL: %d)
                                <br>- Ngày mượn: %s
                                <br>- Hạn trả: %s
                                <br>- <span style="color: red;">Số ngày quá hạn: %d ngày</span>
                            </li>
                        """, i + 1, item.toolName(), item.quantity(), borrowDateStr, dueDateStr, item.overdueDays()));
            }

            String htmlContent = String.format("""
                    <html>
                    <body>
                        <h2>Thông báo quá hạn trả CCDC</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Hệ thống ghi nhận bạn đang có <strong>%d</strong> phiếu mượn Công cụ dụng cụ (CCDC) đã quá hạn. Chi tiết như sau:</p>
                        <ul style="list-style-type: none; padding-left: 0;">
                            %s
                        </ul>
                        <p><strong>Yêu cầu:</strong> Vui lòng liên hệ thủ kho CCDC để hoàn trả trong thời gian sớm nhất.</p>
                        <p>Trân trọng,<br>Hệ thống %s</p>
                    </body>
                    </html>
                    """, employeeName, items.size(), itemsHtml.toString(), appName);

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("[EmailService] Đã gửi email nhắc {} CCDC quá hạn thành công tới {}", items.size(), to);

        } catch (MessagingException e) {
            log.error("[EmailService] Lỗi khi gửi email multi tới {}: {}", to, e.getMessage());
            throw new RuntimeException("Gửi email thất bại", e);
        }
    }
}
