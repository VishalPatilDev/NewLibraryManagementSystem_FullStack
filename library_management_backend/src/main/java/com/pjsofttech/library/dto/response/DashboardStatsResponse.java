package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalBooks;
    private long totalBookCopies;
    private long availableCopies;
    private long totalMembers;
    private long activeMembers;
    private long activeLoans;
    private long overdueLoans;
    private long pendingReservations;
    private long pendingFines;
    private long paidFines;
    private BigDecimal totalPendingFineAmount;
    private BigDecimal totalPaidFineAmount;
}