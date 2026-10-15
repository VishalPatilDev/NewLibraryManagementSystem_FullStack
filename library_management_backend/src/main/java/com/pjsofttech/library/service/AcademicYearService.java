package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.AcademicYearRequest;
import com.pjsofttech.library.dto.response.AcademicYearResponse;
import java.util.List;

public interface AcademicYearService {
    AcademicYearResponse create(AcademicYearRequest request);
    AcademicYearResponse getById(Long id);
    AcademicYearResponse getActive();
    List<AcademicYearResponse> getAll();
    AcademicYearResponse update(Long id, AcademicYearRequest request);
    AcademicYearResponse activate(Long id);
}