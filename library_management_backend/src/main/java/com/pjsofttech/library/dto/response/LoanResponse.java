package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.AcademicYear;
import com.pjsofttech.library.model.LoanStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class LoanResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private String membershipNumber;
    private AcademicYear academicYear;
    private Long bookCopyId;
    private String barcode;
    private String bookTitle;
    private String bookIsbn;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanStatus status;
    private Integer renewedCount;
    private BigDecimal fineAmount;
    private String issuedBy;
    private LocalDateTime createdAt;
}