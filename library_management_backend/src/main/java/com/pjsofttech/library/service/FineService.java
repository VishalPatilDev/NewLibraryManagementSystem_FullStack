package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.WaiveFineRequest;
import com.pjsofttech.library.dto.response.FineResponse;
import com.pjsofttech.library.model.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface FineService {
    void createFine(Loan loan);
    FineResponse getById(Long id);
    FineResponse getByLoanId(Long loanId);
    Page<FineResponse> getAll(Pageable pageable);
    Page<FineResponse> getFinesByMember(Long memberId, Pageable pageable);
    FineResponse payFine(Long fineId);
    FineResponse waiveFine(Long fineId, WaiveFineRequest request, String waivedByEmail);
    BigDecimal getTotalPendingFineForMember(Long memberId);
    void notifyNextReservation(Long bookId);



}