package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class BookRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title too long")
    private String title;

    @NotBlank(message = "ISBN is required")
    @Size(min = 10, max = 20, message = "ISBN must be between 10 and 20 characters")
    private String isbn;

    @Size(max = 5000)
    private String description;

    @Min(value = 1000, message = "Publication year must be valid")
    @Max(value = 2100, message = "Publication year must be valid")
    private Integer publicationYear;

    @Size(max = 50)
    private String language;

    private Long publisherId;

    private Long categoryId;

    @NotNull(message = "At least one author is required")
    @Size(min = 1, message = "At least one author is required")
    private Set<Long> authorIds;
}