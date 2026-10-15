package com.pjsofttech.library.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * AcademicYear — represents a school academic year (e.g. 2024-2025).
 * This is the most school-specific entity in the system.
 *
 * Why it matters for a school library:
 * - Member borrowing limits and membership periods reset each academic year
 * - Annual reports (how many books issued in 2024-25) are tied to this
 * - Fine waivers often happen at end of academic year
 * - New book budgets are allocated per academic year
 *
 * Relationship:
 * - Member → AcademicYear (which year they enrolled)
 * - Loan → AcademicYear (for annual reports)
 */
@Entity
@Table(name = "academic_years")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AcademicYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * e.g. "2024-2025"
     */
    @Column(nullable = false, unique = true, length = 20)
    private String yearLabel;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /**
     * Only one academic year should be active at a time.
     * The active year is used for all new member registrations and loans.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    /**
     * Max books a student can borrow in this academic year.
     * Schools often change this per year based on policy.
     */
    @Column(name = "max_borrow_limit")
    @Builder.Default
    private Integer maxBorrowLimit = 5;

    /**
     * Loan duration (days) for this academic year.
     */
    @Column(name = "loan_duration_days")
    @Builder.Default
    private Integer loanDurationDays = 14;

    /**
     * Fine amount per day for this academic year (schools revise this).
     */
    @Column(name = "fine_per_day", precision = 8, scale = 2)
    private java.math.BigDecimal finePerDay;

    @Column(length = 300)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}