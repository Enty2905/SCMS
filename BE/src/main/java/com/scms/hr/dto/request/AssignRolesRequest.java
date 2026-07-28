package com.scms.hr.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

/**
 * Danh sách vai trò được gán cho tài khoản. Gửi danh sách rỗng để thu hồi toàn bộ vai trò.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssignRolesRequest {

    @NotNull(message = "INVALID_KEY")
    List<UUID> roleIds;
}
