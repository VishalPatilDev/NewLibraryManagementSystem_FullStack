package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.BookCopyRequest;
import com.pjsofttech.library.dto.request.BookRequest;
import com.pjsofttech.library.service.BookService;
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
@RequestMapping("/pjsofttech/library/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Book and book copy management")
@SecurityRequirement(name = "bearerAuth")
public class BookController {

    private final BookService bookService;

    // ─── Book CRUD ────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    @Operation(summary = "Create a book (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book created successfully", bookService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get book by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Book fetched", bookService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get all books (paginated)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success("Books fetched",
                bookService.getAll(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Search books by title, ISBN, category, language")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (author != null && !author.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success("Books found",
                    bookService.searchByAuthor(author, PageRequest.of(page, size))));
        }
        return ResponseEntity.ok(ApiResponse.success("Books found",
                bookService.search(title, isbn, categoryId, language, PageRequest.of(page, size))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @Operation(summary = "Update book (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Book updated", bookService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BOOK_DELETE')")
    @Operation(summary = "Delete book (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Book deleted"));
    }

    // ─── BookCopy endpoints ───────────────────────────────────────────────────

    @PostMapping("/copies")
    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    @Operation(summary = "Add a physical copy of a book (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> addCopy(@Valid @RequestBody BookCopyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book copy added", bookService.addCopy(request)));
    }

    @GetMapping("/{bookId}/copies")
    @PreAuthorize("hasAuthority('BOOK_READ')")
    @Operation(summary = "Get all physical copies of a book")
    public ResponseEntity<ApiResponse<?>> getCopies(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success("Copies fetched", bookService.getCopiesByBook(bookId)));
    }

    @PatchMapping("/copies/{copyId}/status")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @Operation(summary = "Update copy status: AVAILABLE, ISSUED, RESERVED, LOST, DAMAGED (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> updateCopyStatus(
            @PathVariable Long copyId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Copy status updated",
                bookService.updateCopyStatus(copyId, status)));
    }
}