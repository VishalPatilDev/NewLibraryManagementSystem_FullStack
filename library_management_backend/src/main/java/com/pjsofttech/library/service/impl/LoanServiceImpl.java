package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.LoanRequest;
import com.pjsofttech.library.dto.response.LoanResponse;
import com.pjsofttech.library.exception.*;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.*;
import com.pjsofttech.library.service.FineService;
import com.pjsofttech.library.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final FineService fineService;

    @Value("${library.loan.duration-days:14}")
    private int loanDurationDays;

    @Value("${library.loan.max-books-per-member:5}")
    private int maxBooksPerMember;

    @Value("${library.loan.renewal-days:7}")
    private int renewalDays;

    /**
     * Issues a book copy to a member.
     * - Validates member is ACTIVE
     * - Checks borrowing limit
     * - Picks an available BookCopy
     * - Creates Loan, updates BookCopy status
     * All inside a single @Transactional to ensure data consistency.
     */
    @Override
    @Transactional
    public LoanResponse issueBook(LoanRequest request, String issuedByEmail) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", request.getMemberId()));

        // 1. Member must be ACTIVE
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new MemberBlockedException("Member is " + member.getStatus() + " and cannot borrow books");
        }

        // 2. Check membership expiry
        if (member.getMembershipExpiryDate() != null && member.getMembershipExpiryDate().isBefore(LocalDate.now())) {
            throw new MemberBlockedException("Member's membership has expired");
        }

        // 3. Check borrowing limit
        long activeLoans = loanRepository.countActiveLoansForMember(member.getId());
        if (activeLoans >= maxBooksPerMember) {
            throw new BusinessException("Member has reached the borrowing limit of " + maxBooksPerMember + " books");
        }

        // 4. Verify book exists
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        // 5. Find an available copy
        BookCopy copy = bookCopyRepository.findFirstByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE)
                .orElseThrow(() -> new BookNotAvailableException(
                        "No available copy for book '" + book.getTitle() + "'. Consider making a reservation."));

        if (member.getAcademicYear() == null) {
            throw new BusinessException(
                    "Member does not have an academic year assigned"
            );
        }

        // 6. Create the loan
        LocalDate today = LocalDate.now();
        Loan loan = Loan.builder()
                .member(member)
                .academicYear(member.getAcademicYear())
                .bookCopy(copy)
                .issueDate(today)
                .dueDate(today.plusDays(loanDurationDays))
                .status(LoanStatus.ACTIVE)
                .issuedBy(issuedByEmail)
                .build();
        loanRepository.save(loan);

        // 7. Update copy status
        copy.setStatus(CopyStatus.ISSUED);
        bookCopyRepository.save(copy);

        // 8. Update book available count
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        log.info("Book issued: loanId={}, member={}, book='{}', dueDate={}",
                loan.getId(), member.getMembershipNumber(), book.getTitle(), loan.getDueDate());
        return toResponse(loan);
    }

    /**
     * Returns a book.
     * - Validates loan is still active
     * - Calculates overdue, generates fine if needed
     * - Updates loan and copy status
     */
    @Override
    @Transactional
    public LoanResponse returnBook(Long loanId) {
        Loan loan = findById(loanId);

        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new LoanAlreadyReturnedException("Loan " + loanId + " has already been returned");
        }
        if (loan.getStatus() == LoanStatus.LOST) {
            throw new BusinessException("Cannot return a loan marked as LOST");
        }

        LocalDate today = LocalDate.now();
        loan.setReturnDate(today);
        loan.setStatus(LoanStatus.RETURNED);
        loanRepository.save(loan);

        // Return the copy to AVAILABLE
        BookCopy copy = loan.getBookCopy();
        copy.setStatus(CopyStatus.AVAILABLE);
        bookCopyRepository.save(copy);

        // Update book available count
        Book book = copy.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Calculate fine if overdue
        if (loan.getDueDate() != null &&
                loan.getDueDate().isBefore(today)) {

            fineService.createFine(loan);
        }


        // Handle pending reservations: notify next member in queue
        fineService.notifyNextReservation(book.getId());

        log.info("Book returned: loanId={}", loanId);
        return toResponse(loan);
    }

    /**
     * Renews an active loan by extending the due date.
     */
    @Override
    @Transactional
    public LoanResponse renewLoan(Long loanId) {
        Loan loan = findById(loanId);

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BusinessException("Only ACTIVE loans can be renewed");
        }
        if (loan.getReturnDate() != null) {
            throw new BusinessException("This loan has already been returned");
        }

        loan.setDueDate(loan.getDueDate().plusDays(renewalDays));
        loan.setRenewedCount(loan.getRenewedCount() + 1);
        loanRepository.save(loan);

        log.info("Loan renewed: loanId={}, newDueDate={}", loanId, loan.getDueDate());
        return toResponse(loan);
    }

    @Override
    @Transactional(readOnly = true)
    public LoanResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoanResponse> getAll(Pageable pageable) {
        return loanRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoanResponse> getLoansByMember(Long memberId, Pageable pageable) {
        return loanRepository.findByMemberId(memberId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoanResponse> getOverdueLoans(Pageable pageable) {
        return loanRepository.findOverdueLoansPage(LocalDate.now(), pageable).map(this::toResponse);
    }

    /**
     * Scheduled task: marks active loans past due date as OVERDUE.
     */
    @Override
    @Transactional
    public void markOverdueLoans() {
        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LocalDate.now());
        overdueLoans.forEach(loan -> loan.setStatus(LoanStatus.OVERDUE));
        loanRepository.saveAll(overdueLoans);
        log.info("Marked {} loans as OVERDUE", overdueLoans.size());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Loan findById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", id));
    }

    public LoanResponse toResponse(Loan l) {
        Book book = l.getBookCopy().getBook();
        LoanStatus status = l.getStatus();

        if (status == LoanStatus.ACTIVE
                && l.getDueDate() != null
                && l.getDueDate().isBefore(LocalDate.now())) {
            status = LoanStatus.OVERDUE;
        }
        BigDecimal fineAmount = l.getFine() != null
                ? l.getFine().getTotalAmount()
                : BigDecimal.ZERO;

        return LoanResponse.builder()
                .id(l.getId())
                .memberId(l.getMember().getId())
                .memberName(l.getMember().getUser().getName())
                .membershipNumber(l.getMember().getMembershipNumber())
                .academicYear(l.getAcademicYear())
                .bookCopyId(l.getBookCopy().getId())
                .barcode(l.getBookCopy().getBarcode())
                .bookTitle(book.getTitle())
                .bookIsbn(book.getIsbn())
                .issueDate(l.getIssueDate())
                .dueDate(l.getDueDate())
                .returnDate(l.getReturnDate())
                .status(status)
                .renewedCount(l.getRenewedCount())
                .fineAmount(fineAmount)
                .issuedBy(l.getIssuedBy())
                .createdAt(l.getCreatedAt())
                .build();
    }
}