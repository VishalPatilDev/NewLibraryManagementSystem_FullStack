package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.ReservationRequest;
import com.pjsofttech.library.dto.response.ReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationService {
    ReservationResponse reserve(ReservationRequest request);
    ReservationResponse getById(Long id);
    Page<ReservationResponse> getAll(Pageable pageable);
    Page<ReservationResponse> getByMember(Long memberId, Pageable pageable);
    ReservationResponse cancel(Long id);
}