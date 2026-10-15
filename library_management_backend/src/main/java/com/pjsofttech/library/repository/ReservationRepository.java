package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Reservation;
import com.pjsofttech.library.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByMemberId(Long memberId, Pageable pageable);
    Page<Reservation> findByMemberIdAndStatus(Long memberId, ReservationStatus status, Pageable pageable);
    boolean existsByMemberIdAndBookIdAndStatusIn(Long memberId, Long bookId, List<ReservationStatus> statuses);
    Optional<Reservation> findFirstByBookIdAndStatusOrderByCreatedAtAsc(Long bookId, ReservationStatus status);
    List<Reservation> findByBookIdAndStatus(Long bookId, ReservationStatus status);
    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);
}