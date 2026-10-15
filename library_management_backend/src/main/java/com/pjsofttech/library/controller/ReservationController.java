package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.ReservationRequest;
import com.pjsofttech.library.service.ReservationService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Book reservation management")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasAuthority('RESERVATION_CREATE')")
    @Operation(summary = "Reserve a book (when all copies are unavailable)")
    public ResponseEntity<ApiResponse<?>> reserve(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book reserved successfully",
                        reservationService.reserve(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RESERVATION_READ')")
    @Operation(summary = "Get reservation by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation fetched",
                reservationService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('RESERVATION_MANAGE')")
    @Operation(summary = "Get all reservations (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Reservations fetched",
                reservationService.getAll(PageRequest.of(page, size,
                        Sort.by("createdAt").descending()))));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAuthority('RESERVATION_READ')")
    @Operation(summary = "Get all reservations for a member")
    public ResponseEntity<ApiResponse<?>> getByMember(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Member reservations fetched",
                reservationService.getByMember(memberId, PageRequest.of(page, size,
                        Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('RESERVATION_CANCEL')")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<?>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled",
                reservationService.cancel(id)));
    }
}