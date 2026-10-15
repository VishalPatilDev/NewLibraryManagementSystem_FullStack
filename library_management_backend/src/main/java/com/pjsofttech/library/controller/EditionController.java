package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.EditionRequest;
import com.pjsofttech.library.service.EditionService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/editions")
@RequiredArgsConstructor
@Tag(name = "Editions", description = "Book edition management — track multiple editions of the same book")
@SecurityRequirement(name = "bearerAuth")
public class EditionController {

    private final EditionService editionService;

    @PostMapping
    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    @Operation(summary = "Add a new edition of a book (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody EditionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Edition created", editionService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get edition by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Edition fetched", editionService.getById(id)));
    }

    @GetMapping("/book/{bookId}")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get all editions of a book (sorted: latest first)")
    public ResponseEntity<ApiResponse<?>> getByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success("Editions fetched", editionService.getByBook(bookId)));
    }

    @GetMapping("/book/{bookId}/latest")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get the latest edition of a book")
    public ResponseEntity<ApiResponse<?>> getLatest(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success("Latest edition fetched", editionService.getLatestEdition(bookId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @Operation(summary = "Update edition (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id, @Valid @RequestBody EditionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Edition updated", editionService.update(id, request)));
    }

    @PatchMapping("/{id}/mark-latest")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @Operation(summary = "Mark this edition as the latest edition for its book")
    public ResponseEntity<ApiResponse<?>> markAsLatest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Marked as latest edition", editionService.markAsLatest(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_DELETE')")
    @Operation(summary = "Delete edition — only allowed if it has no copies (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        editionService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Edition deleted"));
    }
}