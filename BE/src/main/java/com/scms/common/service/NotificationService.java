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
}
