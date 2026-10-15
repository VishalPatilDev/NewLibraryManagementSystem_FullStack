package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.LoanRequest;
import com.pjsofttech.library.service.LoanService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/loans")
@RequiredArgsConstructor
@Tag(name = "Loans", description = "Book issue, return, and renewal")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/issue")
    @PreAuthorize("hasAuthority('LOAN_CREATE')")
    @Operation(summary = "Issue a book to a member (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> issueBook(
            @Valid @RequestBody LoanRequest request,
            Authentication authentication) {
        String issuedBy = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book issued successfully",
                        loanService.issueBook(request, issuedBy)));
    }

    @PostMapping("/{loanId}/return")
    @PreAuthorize("hasAuthority('LOAN_RETURN')")
    @Operation(summary = "Return a borrowed book (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> returnBook(@PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully",
                loanService.returnBook(loanId)));
    }

    @PostMapping("/{loanId}/renew")
    @PreAuthorize("hasAuthority('LOAN_RENEW')")
    @Operation(summary = "Renew an active loan")
    public ResponseEntity<ApiResponse<?>> renewLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success("Loan renewed successfully",
                loanService.renewLoan(loanId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('LOAN_READ')")
    @Operation(summary = "Get loan by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Loan fetched", loanService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LOAN_MANAGE')")
    @Operation(summary = "Get all loans (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Loans fetched",
                loanService.getAll(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAuthority('LOAN_READ')")
    @Operation(summary = "Get all loans for a specific member")
    public ResponseEntity<ApiResponse<?>> getByMember(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Member loans fetched",
                loanService.getLoansByMember(memberId, PageRequest.of(page, size,
                        Sort.by("createdAt").descending()))));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('LOAN_MANAGE')")
    @Operation(summary = "Get all overdue loans (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> getOverdue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Overdue loans fetched",
                loanService.getOverdueLoans(PageRequest.of(page, size))));
    }
}