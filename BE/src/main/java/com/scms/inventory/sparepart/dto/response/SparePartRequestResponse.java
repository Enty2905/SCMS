package com.scms.inventory.sparepart.dto.response;

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
public class SparePartRequestResponse {
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
    List<SparePartRequestItemResponse> items;
}
