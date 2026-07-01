package com.scms.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {

    @NotBlank(message = "Role code không được để trống")
    @Size(max = 50, message = "Role code tối đa 50 ký tự")
    String roleCode;

    @NotBlank(message = "Role name không được để trống")
    @Size(max = 100, message = "Role name tối đa 100 ký tự")
    String roleName;

    String description;
}
