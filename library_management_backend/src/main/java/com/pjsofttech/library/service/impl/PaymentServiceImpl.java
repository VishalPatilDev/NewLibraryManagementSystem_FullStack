package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.PaymentVerifyRequest;
import com.pjsofttech.library.dto.response.PaymentOrderResponse;
import com.pjsofttech.library.dto.response.PaymentResponse;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.Fine;
import com.pjsofttech.library.model.FineStatus;
import com.pjsofttech.library.model.Payment;
import com.pjsofttech.library.model.PaymentStatus;
import com.pjsofttech.library.repository.FineRepository;
import com.pjsofttech.library.repository.PaymentRepository;
import com.pjsofttech.library.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpaySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Override
    @Transactional
    public PaymentOrderResponse createFinePaymentOrder(Long fineId) {

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Fine", fineId));

        // Fine must be pending
        if (fine.getStatus() != FineStatus.PENDING) {
            throw new BusinessException(
                    "Fine " + fineId + " is not pending"
            );
        }

        // Calculate current overdue days
        LocalDate today = LocalDate.now();

        if (fine.getLoan() == null ||
                fine.getLoan().getDueDate() == null) {

            throw new BusinessException(
                    "Fine does not have a valid loan/due date"
            );
        }

        long overdueDays = ChronoUnit.DAYS.between(
                fine.getLoan().getDueDate(),
                today
        );

        if (overdueDays <= 0) {
            throw new BusinessException(
                    "Fine is no longer overdue"
            );
        }

        // Calculate current fine amount
        BigDecimal amount = fine.getFinePerDay()
                .multiply(BigDecimal.valueOf(overdueDays));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "Fine amount must be greater than zero"
            );
        }

        /*
         * Razorpay expects amount in the smallest currency unit.
         *
         * Example:
         * INR 100.00 -> 10000 paise
         */
        int amountInPaise = amount
                .multiply(BigDecimal.valueOf(100))
                .intValueExact();

        try {

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put(
                    "receipt",
                    "fine_" + fineId + "_" + System.currentTimeMillis()
            );

            JSONObject notes = new JSONObject();
            notes.put("fine_id", String.valueOf(fineId));

            orderRequest.put("notes", notes);

            /*
             * Create Razorpay Order
             */
            Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            /*
             * Save local payment record
             */
            Payment payment = Payment.builder()
                    .fine(fine)
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amount)
                    .currency(currency)
                    .status(PaymentStatus.CREATED)
                    .build();

            paymentRepository.save(payment);

            log.info(
                    "Razorpay order created: fineId={}, orderId={}, amount={}",
                    fineId,
                    razorpayOrderId,
                    amount
            );

            return PaymentOrderResponse.builder()
                    .fineId(fineId)
                    .paymentId(payment.getId())
                    .razorpayOrderId(razorpayOrderId)
                    .keyId(razorpayKeyId)
                    .amount(amount)
                    .currency(currency)
                    .build();

        } catch (RazorpayException e) {

            log.error(
                    "Failed to create Razorpay order for fine {}",
                    fineId,
                    e
            );

            throw new BusinessException(
                    "Unable to create payment order"
            );
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(
            PaymentVerifyRequest request
    ) {

        Fine fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Fine",
                                request.getFineId()
                        ));

        // Fine must still be pending
        if (fine.getStatus() != FineStatus.PENDING) {
            throw new BusinessException(
                    "Fine is already " + fine.getStatus()
            );
        }

        /*
         * Find our local payment using the Razorpay order ID.
         */
        Payment payment = paymentRepository
                .findByRazorpayOrderId(
                        request.getRazorpayOrderId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment order ,"+
                                request.getRazorpayOrderId()
                        ));

        /*
         * Make sure this payment belongs to this fine.
         */
        if (!payment.getFine().getId()
                .equals(fine.getId())) {

            throw new BusinessException(
                    "Payment does not belong to this fine"
            );
        }

        /*
         * Prevent re-processing an already captured payment.
         */
        if (payment.getStatus() == PaymentStatus.CAPTURED) {
            throw new BusinessException(
                    "Payment has already been captured"
            );
        }

        try {

            /*
             * IMPORTANT:
             * Use the Razorpay order ID stored in our database,
             * not blindly trust the frontend value.
             */
            JSONObject options = new JSONObject();

            options.put(
                    "razorpay_order_id",
                    payment.getRazorpayOrderId()
            );

            options.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            options.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );

            /*
             * Verify Razorpay signature.
             */
            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            options,
                            razorpaySecret
                    );

            if (!signatureValid) {

                throw new BusinessException(
                        "Invalid Razorpay payment signature"
                );
            }

            /*
             * Fetch actual payment from Razorpay.
             */
            com.razorpay.Payment razorpayPayment =
                    razorpayClient.payments.fetch(
                            request.getRazorpayPaymentId()
                    );

            String razorpayStatus =
                    razorpayPayment.get("status");

            int razorpayAmount =
                    razorpayPayment.get("amount");

            String razorpayCurrency =
                    razorpayPayment.get("currency");

            /*
             * Verify amount.
             */
            int expectedAmount = payment.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .intValueExact();

            if (razorpayAmount != expectedAmount) {

                throw new BusinessException(
                        "Payment amount does not match fine amount"
                );
            }

            /*
             * Verify currency.
             */
            if (!currency.equalsIgnoreCase(
                    razorpayCurrency
            )) {

                throw new BusinessException(
                        "Payment currency does not match"
                );
            }

            /*
             * Verify payment is captured.
             */
            if (!"captured".equalsIgnoreCase(
                    razorpayStatus
            )) {

                throw new BusinessException(
                        "Payment is not captured. Current status: "
                                + razorpayStatus
                );
            }

            /*
             * Update local Payment.
             */
            payment.setRazorpayPaymentId(
                    request.getRazorpayPaymentId()
            );

            payment.setRazorpaySignature(
                    request.getRazorpaySignature()
            );

            payment.setStatus(
                    PaymentStatus.CAPTURED
            );

            payment.setPaidAt(
                    LocalDateTime.now()
            );

            paymentRepository.save(payment);

            /*
             * Mark Fine as PAID.
             */
            fine.setStatus(FineStatus.PAID);
            fine.setPaidAt(LocalDateTime.now());

            fineRepository.save(fine);

            log.info(
                    "Fine paid successfully: fineId={}, paymentId={}",
                    fine.getId(),
                    request.getRazorpayPaymentId()
            );

            /*
             * Return payment response.
             */
            return PaymentResponse.builder()
                    .paymentId(payment.getId())
                    .fineId(fine.getId())
                    .razorpayPaymentId(
                            payment.getRazorpayPaymentId()
                    )
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(payment.getStatus())
                    .paidAt(payment.getPaidAt())
                    .build();

        } catch (RazorpayException e) {

            log.error(
                    "Failed to verify Razorpay payment: paymentId={}",
                    request.getRazorpayPaymentId(),
                    e
            );

            throw new BusinessException(
                    "Unable to verify Razorpay payment"
            );
        }
    }

}
