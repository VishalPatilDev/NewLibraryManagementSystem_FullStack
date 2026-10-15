package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentOrderResponse {

    private Long fineId;

    private Long paymentId;

    private String razorpayOrderId;

    private String keyId;

    private BigDecimal amount;

    private String currency;
}
