package com.scms.user.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Dùng cho người dùng tự cập nhật thông tin cá nhân của mình (không phải ADMIN)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    String phone;
    String avatarUrl;
}
