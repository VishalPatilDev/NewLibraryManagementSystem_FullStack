package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    Optional<AcademicYear> findByYearLabel(String yearLabel);

    Optional<AcademicYear> findByIsActiveTrue();

    boolean existsByYearLabel(String yearLabel);
    boolean existsById(Long id);


    /** Deactivate all years — called before activating a new one */
    @Modifying
    @Query("UPDATE AcademicYear ay SET ay.isActive = false")
    void deactivateAll();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.academicYear.id = :yearId")
    long countLoansByAcademicYear(@Param("yearId") Long yearId);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.academicYear.id = :yearId")
    long countMembersByAcademicYear(@Param("yearId") Long yearId);
}