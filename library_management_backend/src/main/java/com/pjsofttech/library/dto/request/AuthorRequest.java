package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthorRequest {

    @NotBlank(message = "Author name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 2000, message = "Biography too long")
    private String biography;

    @Size(max = 100)
    private String nationality;
}