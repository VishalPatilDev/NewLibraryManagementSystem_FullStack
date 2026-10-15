//package com.pjsofttech.library.service.impl;
//
//import com.pjsofttech.library.dto.request.WaiveFineRequest;
//import com.pjsofttech.library.dto.response.FineResponse;
//import com.pjsofttech.library.exception.FineAlreadyPaidException;
//import com.pjsofttech.library.exception.ResourceNotFoundException;
//import com.pjsofttech.library.model.*;
//import com.pjsofttech.library.repository.FineRepository;
//import com.pjsofttech.library.repository.ReservationRepository;
//import com.pjsofttech.library.service.FineService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.temporal.ChronoUnit;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class FineServiceImplCopy implements FineService {
//    private final FineRepository fineRepository;
//    private final ReservationRepository reservationRepository;
//    @Value("${library.fine.per-day:5.00}")
//    private BigDecimal finePerDay;
//
//    @Override
//    @Transactional
//    public void createFine(Loan loan) {
//        LocalDate today = LocalDate.now();
//        if (loan.getDueDate() == null || !loan.getDueDate().isBefore(today)) {
//            return;
//        }
//
//        long overdueDays = ChronoUnit.DAYS.between(
//                loan.getDueDate(),
//                today
//        );
//
//        if (overdueDays <= 0) {
//            return;
//        }
//        Optional<Fine> existingFine = fineRepository.findByLoanId(loan.getId());
//
//        if (existingFine.isPresent()) {
//            Fine fine = existingFine.get();
//
//            // Update dynamically
//            fine.setOverdueDays((int) overdueDays);
//            fine.setFinePerDay(finePerDay);
//            fine.setTotalAmount(
//                    finePerDay.multiply(BigDecimal.valueOf(overdueDays))
//            );
//
//            fineRepository.save(fine);
//
//            return;
//        }
//        BigDecimal total = finePerDay.multiply(
//                BigDecimal.valueOf(overdueDays)
//        );
//        Fine fine = Fine.builder()
//                .loan(loan)
//                .overdueDays((int) overdueDays)
//                .finePerDay(finePerDay)
//                .totalAmount(total)
//                .status(FineStatus.PENDING)
//                .build();
//
//        fineRepository.save(fine);
//        log.info(
//                "Fine created: loanId={}, overdueDays={}, total={}",
//                loan.getId(),
//                overdueDays,
//                total
//        );
//    }
//
////    @Override
////    @Transactional
////    public void createFine(Loan loan, int overdueDays) {
////        // Idempotent: don't create duplicate fines
////        if (fineRepository.findByLoanId(loan.getId()).isPresent()) {
////            return;
////        }
////        BigDecimal total = finePerDay.multiply(BigDecimal.valueOf(overdueDays));
////        Fine fine = Fine.builder()
////                .loan(loan)
////                .overdueDays(overdueDays)
////                .finePerDay(finePerDay)
////                .totalAmount(total)
////                .status(FineStatus.PENDING)
////                .build();
////        fineRepository.save(fine);
////        log.info("Fine created: loanId={}, overdueDays={}, total={}", loan.getId(), overdueDays, total);
////    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public FineResponse getById(Long id) {
//        return toResponse(findById(id));
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public FineResponse getByLoanId(Long loanId) {
//        Fine fine = fineRepository.findByLoanId(loanId)
//                .orElseThrow(() -> new ResourceNotFoundException("Fine for loanId " + loanId + " not found"));
//        return toResponse(fine);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Page<FineResponse> getAll(Pageable pageable) {
//        return fineRepository.findAll(pageable).map(this::toResponse);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Page<FineResponse> getFinesByMember(Long memberId, Pageable pageable) {
//        return fineRepository.findByMemberId(memberId, pageable).map(this::toResponse);
//    }
//
//    @Override
//    @Transactional
//    public FineResponse payFine(Long fineId) {
//        Fine fine = findById(fineId);
//        if (fine.getStatus() == FineStatus.PAID) {
//            throw new FineAlreadyPaidException("Fine " + fineId + " is already paid");
//        }
//        if (fine.getStatus() == FineStatus.WAIVED) {
//            throw new FineAlreadyPaidException("Fine " + fineId + " has been waived");
//        }
//        fine.setStatus(FineStatus.PAID);
//        fine.setPaidAt(LocalDateTime.now());
//        fineRepository.save(fine);
//        log.info("Fine paid: fineId={}", fineId);
//        return toResponse(fine);
//    }
//
//    @Override
//    @Transactional
//    public FineResponse waiveFine(Long fineId, WaiveFineRequest request, String waivedByEmail) {
//        Fine fine = findById(fineId);
//        if (fine.getStatus() != FineStatus.PENDING) {
//            throw new FineAlreadyPaidException("Fine " + fineId + " is already " + fine.getStatus());
//        }
//        fine.setStatus(FineStatus.WAIVED);
//        fine.setWaivedBy(waivedByEmail);
//        fine.setWaiveReason(request.getReason());
//        fineRepository.save(fine);
//        log.info("Fine waived: fineId={}, by={}", fineId, waivedByEmail);
//        return toResponse(fine);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public BigDecimal getTotalPendingFineForMember(Long memberId) {
//        return fineRepository.sumPendingFinesByMember(memberId);
//    }
//
//    /**
//     * When a book copy becomes available, notify the next member in the reservation queue.
//     */
//    @Override
//    @Transactional
//    public void notifyNextReservation(Long bookId) {
//        Optional<Reservation> nextOpt = reservationRepository
//                .findFirstByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.PENDING);
//        nextOpt.ifPresent(reservation -> {
//            reservation.setStatus(ReservationStatus.READY);
//            reservation.setNotifiedAt(LocalDateTime.now());
//            reservation.setExpiryDate(LocalDate.now().plusDays(3)); // member has 3 days to pick up
//            reservationRepository.save(reservation);
//            log.info("Reservation READY: reservationId={}, memberId={}, bookId={}",
//                    reservation.getId(), reservation.getMember().getId(), bookId);
//            // In a real system, you'd send an email/push notification here
//        });
//    }
//
//    // ─── Helpers ─────────────────────────────────────────────────────────────
//
//    private Fine findById(Long id) {
//        return fineRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Fine", id));
//    }
//
//    public FineResponse toResponse(Fine f) {
//        Loan loan = f.getLoan();
//        Member member = loan.getMember();
//        BookCopy copy = loan.getBookCopy();
//
//        return FineResponse.builder()
//                .id(f.getId())
//                .loanId(loan.getId())
//                .memberName(member.getUser().getName())
//                .membershipNumber(member.getMembershipNumber())
//                .bookTitle(copy.getBook().getTitle())
//                .barcode(copy.getBarcode())
//                .overdueDays(f.getOverdueDays())
//                .finePerDay(finePerDay)
//                .totalAmount(f.getTotalAmount())
//                .status(f.getStatus())
//                .paidAt(f.getPaidAt())
//                .waivedBy(f.getWaivedBy())
//                .waiveReason(f.getWaiveReason())
//                .createdAt(f.getCreatedAt())
//                .build();
//    }
//}