package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.PublisherRequest;
import com.pjsofttech.library.service.PublisherService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/publishers")
@RequiredArgsConstructor
@Tag(name = "Publishers", description = "Book publisher management")
@SecurityRequirement(name = "bearerAuth")
public class PublisherController {

    private final PublisherService publisherService;

    @PostMapping
    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    @Operation(summary = "Create publisher (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody PublisherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Publisher created", publisherService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get publisher by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Publisher fetched", publisherService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get all publishers")
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Publishers fetched", publisherService.getAll()));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Search publishers by name")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Publishers found",
                publisherService.search(name, PageRequest.of(page, size))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @Operation(summary = "Update publisher (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id, @Valid @RequestBody PublisherRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Publisher updated", publisherService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_DELETE')")
    @Operation(summary = "Delete publisher (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        publisherService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Publisher deleted"));
    }
}