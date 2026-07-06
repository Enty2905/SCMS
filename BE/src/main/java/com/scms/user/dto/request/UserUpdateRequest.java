package com.scms.user.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    Boolean isActive;
    String roleCode; // Thay đổi role (chỉ ADMIN)
}
