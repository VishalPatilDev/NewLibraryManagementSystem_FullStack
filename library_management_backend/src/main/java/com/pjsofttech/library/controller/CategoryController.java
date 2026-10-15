package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.CategoryRequest;
import com.pjsofttech.library.service.CategoryService;
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
@RequestMapping("/pjsofttech/library/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Book category management")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasAuthority('CATEGORY_CREATE')")
    @Operation(summary = "Create a category (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", categoryService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_READ')")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category fetched", categoryService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CATEGORY_READ')")
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "false") boolean paged,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (paged) {
            return ResponseEntity.ok(ApiResponse.success("Categories fetched",
                    categoryService.getAllPaged(PageRequest.of(page, size, Sort.by("name")))));
        }
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", categoryService.getAll()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
    @Operation(summary = "Update category (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_DELETE')")
    @Operation(summary = "Delete category (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Category deleted"));
    }
}