        package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.PaymentVerifyRequest;
import com.pjsofttech.library.dto.response.PaymentOrderResponse;
import com.pjsofttech.library.dto.response.PaymentResponse;
import com.pjsofttech.library.service.PaymentService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay fine payment management")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create a Razorpay order for a fine.
     *
     * The frontend uses the returned Razorpay order ID
     * to open Razorpay Checkout.
     */
    @PostMapping("/fine/{fineId}/order")
    @PreAuthorize("hasAuthority('FINE_PAY')")
    @Operation(summary = "Create Razorpay payment order for a fine")
    public ResponseEntity<ApiResponse<?>> createFinePaymentOrder(
            @PathVariable Long fineId) {

        PaymentOrderResponse response =
                paymentService.createFinePaymentOrder(fineId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment order created",
                        response
                )
        );
    }

    /**
     * Verify the Razorpay payment after successful checkout.
     *
     * The backend verifies:
     * - Razorpay signature
     * - Payment amount
     * - Currency
     * - Payment status
     *
     * If everything is valid, the fine is marked as PAID.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasAuthority('FINE_PAY')")
    @Operation(summary = "Verify Razorpay fine payment")
    public ResponseEntity<ApiResponse<?>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        PaymentResponse response =
                paymentService.verifyPayment(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment verified successfully",
                        response
                )
        );
    }
}

