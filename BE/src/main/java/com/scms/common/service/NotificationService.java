package com.scms.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendRepairRequestNotification(Object message) {
        log.info("Sending repair request notification...");
        messagingTemplate.convertAndSend("/topic/repair-requests", message);
    }

    public void sendMaterialRequestNotification(Object message) {
        log.info("Sending material request notification...");
        messagingTemplate.convertAndSend("/topic/material-requests", message);
    }

    /**
     * Gửi thông báo phản hồi về cho người tạo phiếu (issued/rejected).
     * FE lắng nghe /topic/material-request-response.
     */
    public void sendMaterialRequestResponseNotification(Object message) {
        log.info("Sending material request response notification...");
        messagingTemplate.convertAndSend("/topic/material-request-response", message);
    }
}
