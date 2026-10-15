package com.pjsofttech.library.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequest {

    private Long fineId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;
}
