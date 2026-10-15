package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.WaiveFineRequest;
import com.pjsofttech.library.service.FineService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/fines")
@RequiredArgsConstructor
@Tag(name = "Fines", description = "Overdue fine management")
@SecurityRequirement(name = "bearerAuth")
public class FineController {

    private final FineService fineService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('FINE_READ')")
    @Operation(summary = "Get fine by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fine fetched", fineService.getById(id)));
    }

    @GetMapping("/loan/{loanId}")
    @PreAuthorize("hasAuthority('FINE_READ')")
    @Operation(summary = "Get fine by loan ID")
    public ResponseEntity<ApiResponse<?>> getByLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success("Fine fetched", fineService.getByLoanId(loanId)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FINE_MANAGE') or hasAuthority('FINE_READ')")
    @Operation(summary = "Get all fines (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Fines fetched",
                fineService.getAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAuthority('FINE_READ')")
    @Operation(summary = "Get all fines for a member")
    public ResponseEntity<ApiResponse<?>> getByMember(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Member fines fetched",
                fineService.getFinesByMember(memberId, PageRequest.of(page, size))));
    }

    @GetMapping("/member/{memberId}/pending-total")
    @PreAuthorize("hasAuthority('FINE_READ')")
    @Operation(summary = "Get total pending fine amount for a member")
    public ResponseEntity<ApiResponse<?>> getPendingTotal(@PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success("Pending fine total",
                fineService.getTotalPendingFineForMember(memberId)));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAuthority('FINE_PAY')")
    @Operation(summary = "Mark a fine as paid")
    public ResponseEntity<ApiResponse<?>> pay(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fine marked as paid", fineService.payFine(id)));
    }

    @PostMapping("/{id}/waive")
    @PreAuthorize("hasAuthority('FINE_WAIVE')")
    @Operation(summary = "Waive a fine (ADMIN/LIBRARIAN only)")
    public ResponseEntity<ApiResponse<?>> waive(
            @PathVariable Long id,
            @Valid @RequestBody WaiveFineRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Fine waived",
                fineService.waiveFine(id, request, authentication.getName())));
    }
}