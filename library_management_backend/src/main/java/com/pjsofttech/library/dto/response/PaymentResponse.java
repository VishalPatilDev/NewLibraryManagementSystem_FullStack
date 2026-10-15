package com.pjsofttech.library.dto.response;


import com.pjsofttech.library.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long paymentId;

    private Long fineId;

    private String razorpayPaymentId;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus status;

    private LocalDateTime paidAt;

}

