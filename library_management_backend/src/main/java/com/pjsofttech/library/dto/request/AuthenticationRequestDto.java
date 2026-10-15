package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequestDto {
    @NotNull(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;
    @NotNull(message = "Password is required")
    @Size(min = 6, max = 100,message = "Password must be between 6 and 100 characters")
    private String password;
}
