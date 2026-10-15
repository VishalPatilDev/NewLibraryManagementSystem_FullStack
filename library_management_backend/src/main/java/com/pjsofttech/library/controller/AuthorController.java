package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.AuthorRequest;
import com.pjsofttech.library.service.AuthorService;
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
@RequestMapping("/pjsofttech/library/authors")
@RequiredArgsConstructor
@Tag(name = "Authors", description = "Author management")
@SecurityRequirement(name = "bearerAuth")
public class AuthorController {

    private final AuthorService authorService;

    @PostMapping
    @PreAuthorize("hasAuthority('AUTHOR_CREATE')")
    @Operation(summary = "Create author (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Author created", authorService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUTHOR_READ')")
    @Operation(summary = "Get author by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Author fetched", authorService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('AUTHOR_READ')")
    @Operation(summary = "Get all authors (paginated)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ResponseEntity.ok(ApiResponse.success("Authors fetched",
                authorService.getAll(PageRequest.of(page, size, Sort.by(sortBy)))));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('AUTHOR_READ')")
    @Operation(summary = "Search authors by name")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Authors found",
                authorService.searchByName(name, PageRequest.of(page, size))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('AUTHOR_UPDATE')")
    @Operation(summary = "Update author (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Author updated", authorService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AUTHOR_DELETE')")
    @Operation(summary = "Delete author (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Author deleted"));
    }
}