package com.scms.inventory.consumable.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsumableRequestResponse {
    UUID reqId;
    String reqNumber;
    UUID orderId;
    String orderNumber;
    String status;
    String pdfUrl;
    String createdByUsername;
    String createdByName;
    LocalDateTime createdAt;
    String issuedByName;
    LocalDateTime issuedAt;
    String note;
    List<ConsumableRequestItemResponse> items;
}
