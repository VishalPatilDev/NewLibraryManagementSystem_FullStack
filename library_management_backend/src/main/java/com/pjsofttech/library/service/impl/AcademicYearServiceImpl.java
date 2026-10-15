package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.AcademicYearRequest;
import com.pjsofttech.library.dto.response.AcademicYearResponse;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.AcademicYear;
import com.pjsofttech.library.repository.AcademicYearRepository;
import com.pjsofttech.library.service.AcademicYearService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public AcademicYearResponse create(AcademicYearRequest request) {
        if (academicYearRepository.existsByYearLabel(request.getYearLabel())) {
            throw new DuplicateResourceException("Academic year '" + request.getYearLabel() + "' already exists");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date must be after start date");
        }

        AcademicYear saved = academicYearRepository.save(AcademicYear.builder()
                .yearLabel(request.getYearLabel())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(false)
                .maxBorrowLimit(request.getMaxBorrowLimit() != null ? request.getMaxBorrowLimit() : 5)
                .loanDurationDays(request.getLoanDurationDays() != null ? request.getLoanDurationDays() : 14)
                .finePerDay(request.getFinePerDay())
                .description(request.getDescription())
                .build());
        log.info("Academic year created: {}", saved.getYearLabel());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicYearResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicYearResponse getActive() {
        AcademicYear active = academicYearRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active academic year found. Please activate one."));
        return toResponse(active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicYearResponse> getAll() {
        return academicYearRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AcademicYearResponse update(Long id, AcademicYearRequest request) {
        AcademicYear year = findById(id);
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date must be after start date");
        }

        if (!year.getYearLabel().equals(request.getYearLabel())
                && academicYearRepository.existsByYearLabel(request.getYearLabel())) {
            throw new DuplicateResourceException("Academic year '" + request.getYearLabel() + "' already exists");
        }
        year.setYearLabel(request.getYearLabel());
        year.setStartDate(request.getStartDate());
        year.setEndDate(request.getEndDate());
        year.setMaxBorrowLimit(request.getMaxBorrowLimit());
        year.setLoanDurationDays(request.getLoanDurationDays());
        year.setFinePerDay(request.getFinePerDay());
        year.setDescription(request.getDescription());
        return toResponse(academicYearRepository.save(year));
    }

    @Override
    @Transactional
    public AcademicYearResponse activate(Long id) {

        AcademicYear year = findById(id);

        LocalDate today = LocalDate.now();

        if (today.isBefore(year.getStartDate()) || today.isAfter(year.getEndDate())) {
            throw new BusinessException(
                    "Academic year '" + year.getYearLabel() +
                            "' cannot be activated because today is outside its date range."
            );
        }
        // Deactivate all, then activate the selected one
        academicYearRepository.deactivateAll();
        year.setIsActive(true);
        AcademicYear saved = academicYearRepository.save(year);
        log.info("Academic year activated: {}", saved.getYearLabel());
        return toResponse(saved);
    }

    private AcademicYear findById(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear", id));
    }

    public AcademicYearResponse toResponse(AcademicYear a) {
        return AcademicYearResponse.builder()
                .id(a.getId())
                .yearLabel(a.getYearLabel())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .isActive(a.getIsActive())
                .maxBorrowLimit(a.getMaxBorrowLimit())
                .loanDurationDays(a.getLoanDurationDays())
                .finePerDay(a.getFinePerDay())
                .description(a.getDescription())
//                .totalLoans(academicYearRepository.countLoansByAcademicYear(a.getId()))
//                .totalMembers(academicYearRepository.countMembersByAcademicYear(a.getId()))
                .createdAt(a.getCreatedAt())
                .build();
    }
}