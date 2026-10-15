package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Fine;
import com.pjsofttech.library.model.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    Optional<Fine> findByLoanId(Long loanId);

    @Query("SELECT f FROM Fine f WHERE f.loan.member.id = :memberId")
    Page<Fine> findByMemberId(@Param("memberId") Long memberId, Pageable pageable);

    @Query("SELECT f FROM Fine f WHERE f.loan.member.id = :memberId AND f.status = :status")
    Page<Fine> findByMemberIdAndStatus(@Param("memberId") Long memberId,
                                       @Param("status") FineStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.totalAmount),0) FROM Fine f WHERE f.loan.member.id = :memberId AND f.status = 'PENDING'")
    BigDecimal sumPendingFinesByMember(@Param("memberId") Long memberId);

    Page<Fine> findByStatus(FineStatus status, Pageable pageable);
}