package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AcademicYearRequest {

    @NotBlank(message = "Year label is required e.g. 2024-2025")
    @Size(max = 20)
    private String yearLabel;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Min(value = 1, message = "Borrow limit must be at least 1")
    @Max(value = 20)
    private Integer maxBorrowLimit = 5;

    @Min(value = 1)
    @Max(value = 60)
    private Integer loanDurationDays = 14;

    @DecimalMin("0.0")
    private BigDecimal finePerDay;

    private String description;
}