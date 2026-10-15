package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Loan;
import com.pjsofttech.library.model.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByMemberId(Long memberId, Pageable pageable);
    Page<Loan> findByMemberIdAndStatus(Long memberId, LoanStatus status, Pageable pageable);
    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);
    boolean existsByMemberIdAndBookCopyIdAndStatus(Long memberId, Long bookCopyId, LoanStatus status);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member.id = :memberId AND l.status = 'ACTIVE'")
    long countActiveLoansForMember(@Param("memberId") Long memberId);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    Page<Loan> findOverdueLoansPage(@Param("today") LocalDate today, Pageable pageable);
}