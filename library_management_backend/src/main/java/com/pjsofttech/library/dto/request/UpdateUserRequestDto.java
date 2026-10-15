package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequestDto {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50)
    private String name;
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;
    @NotNull(message = "Date of birth is required")
    @Past(message = "Cannot be a future date")
    private LocalDate dateOfBirth;
}

