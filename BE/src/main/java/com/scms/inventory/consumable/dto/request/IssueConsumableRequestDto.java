package com.scms.inventory.consumable.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class IssueConsumableRequestDto {

    @NotEmpty(message = "Danh sách vật tư cấp phát không được rỗng")
    @Valid
    private List<IssuedItem> items;

    private String note;

    @Data
    public static class IssuedItem {

        @NotNull(message = "itemId không được null")
        private UUID itemId;

        @NotNull(message = "Số lượng thực cấp không được null")
        @Min(value = 1, message = "Số lượng thực cấp phải >= 1")
        private Integer quantityIssued;
    }
}
