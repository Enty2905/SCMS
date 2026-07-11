package com.scms.inventory.consumable.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateConsumableRequestDto {

    @NotNull(message = "Phiếu công tác liên kết không được để trống")
    UUID orderId;

    @NotEmpty(message = "Danh sách vật tư không được để trống")
    List<ItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ItemRequest {
        @NotNull(message = "ID vật tư không được để trống")
        UUID consumableId;

        @NotNull(message = "Số lượng yêu cầu không được để trống")
        Integer quantityRequested;
    }
}
