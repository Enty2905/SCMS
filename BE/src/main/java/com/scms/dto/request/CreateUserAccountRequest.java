package com.scms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateUserAccountRequest {

    @NotNull(message = "INVALID_KEY")
    UUID employeeId;

    @NotBlank(message = "INVALID_KEY")
    @Size(min = 3, max = 100, message = "INVALID_KEY")
    String username;

    @NotBlank(message = "INVALID_KEY")
    @Size(min = 6, max = 100, message = "INVALID_KEY")
    String password;
}
