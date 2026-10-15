// src/main/java/com/pjsofttech/library/service/FineCalculationService.java
package com.pjsofttech.library.service;

import com.pjsofttech.library.model.Fine;
import com.pjsofttech.library.model.FineStatus;
import com.pjsofttech.library.model.Loan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Single source of truth for all fine amount calculations.
 *
 * Rule:
 *   PENDING  → dynamic  : current overdue days × Fine.finePerDay
 *   PAID     → finalized: Fine.overdueDays, Fine.totalAmount (stored at payment time)
 *   WAIVED   → finalized: Fine.overdueDays, Fine.totalAmount (stored at waiver time)
 *
 * No other service, controller, or the React frontend should duplicate this logic.
 */
@Service
@RequiredArgsConstructor
public class FineCalculationService {

    private final Clock clock;

    // ── Core primitives ───────────────────────────────────────────────────────


    /**
     * Calculate how many days a loan is overdue as of today.
     * Returns 0 if the loan is not yet overdue.
     */
    public int calculateOverdueDays(Loan loan, LocalDate today) {
        if (loan.getDueDate() == null) return 0;
        if (!loan.getDueDate().isBefore(today)) return 0;
        return (int) ChronoUnit.DAYS.between(loan.getDueDate(), today);
    }

    /**
     * Multiply finePerDay × overdueDays.
     * This is the ONLY place that formula lives.
     */
    public BigDecimal calculateFineAmount(BigDecimal finePerDay, int overdueDays) {
        if (overdueDays <= 0) return BigDecimal.ZERO;
        return finePerDay.multiply(BigDecimal.valueOf(overdueDays));
    }

    // ── Status-aware helpers (used by FineServiceImpl, DashboardService, etc.) ─

    /**
     * Returns the CURRENT effective overdue days for a fine.
     *
     * PENDING → dynamically computed from Loan.dueDate and today
     * PAID / WAIVED → stored Fine.overdueDays (finalized at payment/waiver time)
     */
    public int effectiveOverdueDays(Fine fine) {
        if (fine.getStatus() == FineStatus.PENDING) {
            return calculateOverdueDays(fine.getLoan(), LocalDate.now(clock));
        }
        return fine.getOverdueDays(); // finalized

    }

    /**
     * Returns the CURRENT effective total amount for a fine.
     *
     * PENDING → dynamically computed: effectiveOverdueDays × Fine.finePerDay
     *           Uses Fine.finePerDay (Option B — rate locked at creation time)
     * PAID / WAIVED → stored Fine.totalAmount (never recalculates)
     */
    public BigDecimal effectiveTotalAmount(Fine fine) {
        if (fine.getStatus() == FineStatus.PENDING) {
            int days = effectiveOverdueDays(fine);
            return calculateFineAmount(fine.getFinePerDay(), days);
        }
        return fine.getTotalAmount(); // finalized
    }

    /**
     * Convenience: today from the injected clock.
     */
    public LocalDate today() {
        return LocalDate.now(clock);
    }
}