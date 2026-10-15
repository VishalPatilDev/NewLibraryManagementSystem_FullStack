package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.ReservationRequest;
import com.pjsofttech.library.dto.response.ReservationResponse;
import com.pjsofttech.library.exception.*;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.*;
import com.pjsofttech.library.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    @Override
    @Transactional
    public ReservationResponse reserve(ReservationRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", request.getMemberId()));

        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new MemberBlockedException("Member is " + member.getStatus() + " and cannot make reservations");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        // Prevent duplicate active reservations
        boolean alreadyReserved = reservationRepository.existsByMemberIdAndBookIdAndStatusIn(
                member.getId(), book.getId(),
                List.of(ReservationStatus.PENDING, ReservationStatus.READY));
        if (alreadyReserved) {
            throw new DuplicateResourceException("Member already has an active reservation for this book");
        }

        // Only allow reservation if no copies are currently available
        long availableCopies = bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        if (availableCopies > 0) {
            throw new BusinessException("Book has available copies. Please borrow it directly instead of reserving.");
        }

        Reservation reservation = Reservation.builder()
                .member(member)
                .book(book)
                .reservationDate(LocalDate.now())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created: id={}, member={}, book='{}'",
                saved.getId(), member.getMembershipNumber(), book.getTitle());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getAll(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getByMember(Long memberId, Pageable pageable) {
        return reservationRepository.findByMemberId(memberId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ReservationResponse cancel(Long id) {
        Reservation reservation = findById(id);
        if (reservation.getStatus() == ReservationStatus.FULFILLED
                || reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BusinessException("Reservation is already " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        log.info("Reservation cancelled: id={}", id);
        return toResponse(reservationRepository.save(reservation));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
    }

    public ReservationResponse toResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .memberId(r.getMember().getId())
                .memberName(r.getMember().getUser().getName())
                .membershipNumber(r.getMember().getMembershipNumber())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .bookIsbn(r.getBook().getIsbn())
                .reservationDate(r.getReservationDate())
                .expiryDate(r.getExpiryDate())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}