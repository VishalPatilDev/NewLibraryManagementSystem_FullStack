package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.FineStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FineResponse {
    private Long id;
    private Long loanId;
    private String memberName;
    private String membershipNumber;
    private String bookTitle;
    private String barcode;
    private Integer overdueDays;
    private BigDecimal finePerDay;
    private BigDecimal totalAmount;
    private FineStatus status;
    private LocalDateTime paidAt;
    private String waivedBy;
    private String waiveReason;
    private LocalDateTime createdAt;
}