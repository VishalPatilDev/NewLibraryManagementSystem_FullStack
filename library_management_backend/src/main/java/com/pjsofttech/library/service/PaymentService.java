package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.PaymentVerifyRequest;
import com.pjsofttech.library.dto.response.PaymentOrderResponse;
import com.pjsofttech.library.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentOrderResponse createFinePaymentOrder(Long fineId);

    PaymentResponse verifyPayment(PaymentVerifyRequest request);
}
