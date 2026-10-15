package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.response.DashboardStatsResponse;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;

    private BigDecimal calculateTotalFinePaid(){
        List<Fine> fines = fineRepository.findAll()
                .stream().filter(f->f.getStatus().equals(FineStatus.PAID))
                .toList();
        return fines.stream()
                .map(Fine::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalFinePending(){
        return fineRepository.findAll()
                .stream()
                .filter(f->f.getStatus().equals(FineStatus.PENDING))
                .map(Fine::getTotalAmount)
                .reduce(BigDecimal.ZERO,BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalBooks = bookRepository.count();
        long totalCopies = bookCopyRepository.count();
        long availableCopies = bookCopyRepository.countByBookIdAndStatus(0L, CopyStatus.AVAILABLE); // rough placeholder
        // Better: sum availableCopies across all books
        long totalAvailable = bookRepository.findAll().stream()
                .mapToLong(b -> b.getAvailableCopies()).sum();

        long totalMembers = memberRepository.count();
        long activeMembers = memberRepository.findByStatus(MemberStatus.ACTIVE,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long activeLoans = loanRepository.findByStatus(LoanStatus.ACTIVE,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long overdueLoans = loanRepository.findOverdueLoansPage(LocalDate.now(),
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long pendingReservations = reservationRepository.findByStatus(ReservationStatus.PENDING,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long pendingFines = fineRepository.findByStatus(FineStatus.PENDING,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long paidFines = fineRepository.findByStatus(FineStatus.PAID,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

//        java.math.BigDecimal totalFineAmount = fineRepository.findAll().stream()
//                .filter(f -> f.getStatus() == FineStatus.PENDING)
//                .map(f -> f.getTotalAmount())
//                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);



//        BigDecimal totalFineAmount = fineRepository.findAll().stream()
//                .filter(f -> f.getStatus() == FineStatus.PENDING)
//                .filter(f -> f.getLoan() != null)
//                .filter(f -> f.getLoan().getDueDate() != null)
//                .filter(f -> f.getLoan().getDueDate().isBefore(LocalDate.now()))
//                .map(f -> {
//                    long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(
//                            f.getLoan().getDueDate(),
//                            LocalDate.now()
//                    );
//
//                    return f.getFinePerDay()
//                            .multiply(BigDecimal.valueOf(overdueDays));
//                })
//                .reduce(BigDecimal.ZERO, BigDecimal::add);


        BigDecimal totalFineAmount = calculateTotalFinePending();

//        java.math.BigDecimal totalFinePaidAmount = fineRepository.findAll().stream()
//                .filter(f -> f.getStatus() == FineStatus.PAID)
//                .map(f -> f.getTotalAmount())
//                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

//        BigDecimal totalFinePaidAmount = fineRepository.findAll().stream()
//                .filter(f -> f.getStatus() == FineStatus.PAID)
//                .map(f -> {
//                    long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(
//                            f.getLoan().getDueDate(),
//                            LocalDate.now()
//                    );
//
//                    return f.getFinePerDay()
//                            .multiply(BigDecimal.valueOf(overdueDays));
//                })
//                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFinePaidAmount = calculateTotalFinePaid();





        return DashboardStatsResponse.builder()
                .totalBooks(totalBooks)
                .totalBookCopies(totalCopies)
                .availableCopies(totalAvailable)
                .totalMembers(totalMembers)
                .activeMembers(activeMembers)
                .activeLoans(activeLoans)
                .overdueLoans(overdueLoans)
                .pendingReservations(pendingReservations)
                .pendingFines(pendingFines)
                .paidFines(paidFines)
                .totalPendingFineAmount(totalFineAmount)
                .totalPaidFineAmount(totalFinePaidAmount)
                .build();
    }
}