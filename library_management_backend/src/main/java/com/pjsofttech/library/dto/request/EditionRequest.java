package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EditionRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "Edition number is required")
    @Min(value = 1, message = "Edition number must be at least 1")
    private Integer editionNumber;

    @Size(max = 50)
    private String editionLabel;

    @Min(value = 1000) @Max(value = 2100)
    private Integer publicationYear;

    private LocalDate publicationDate;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Size(min = 10, max = 20, message = "ISBN must be between 10 and 20 characters")
    private String isbn;

    private Boolean isLatest = false;

    private Long publisherId;
}