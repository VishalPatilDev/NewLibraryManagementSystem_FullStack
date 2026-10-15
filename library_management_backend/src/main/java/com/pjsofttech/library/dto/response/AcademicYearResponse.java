package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AcademicYearResponse {
    private Long id;
    private String yearLabel;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Integer maxBorrowLimit;
    private Integer loanDurationDays;
    private BigDecimal finePerDay;
    private String description;
    private Long totalLoans;
    private Long totalMembers;
    private LocalDateTime createdAt;
}