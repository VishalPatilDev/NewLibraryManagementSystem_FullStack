package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.AcademicYearRequest;
import com.pjsofttech.library.service.AcademicYearService;
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
@RequestMapping("/pjsofttech/library/academic-years")
@RequiredArgsConstructor
@Tag(
        name = "Academic Years",
        description = "Academic year management — create, update, activate and manage library academic years"
)
@SecurityRequirement(name = "bearerAuth")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_CREATE')")
    @Operation(summary = "Create a new academic year (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(
            @Valid @RequestBody AcademicYearRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Academic year created",
                        academicYearService.create(request)
                ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_READ')")
    @Operation(summary = "Get academic year by ID")
    public ResponseEntity<ApiResponse<?>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Academic year fetched",
                        academicYearService.getById(id)
                )
        );
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_READ')")
    @Operation(summary = "Get all academic years")
    public ResponseEntity<ApiResponse<?>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Academic years fetched",
                        academicYearService.getAll()
                )
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_READ')")
    @Operation(summary = "Get the currently active academic year")
    public ResponseEntity<ApiResponse<?>> getActive() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active academic year fetched",
                        academicYearService.getActive()
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_UPDATE')")
    @Operation(summary = "Update academic year (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id,
            @Valid @RequestBody AcademicYearRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Academic year updated",
                        academicYearService.update(id, request)
                )
        );
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ACADEMIC_YEAR_UPDATE')")
    @Operation(summary = "Activate an academic year")
    public ResponseEntity<ApiResponse<?>> activate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Academic year activated",
                        academicYearService.activate(id)
                )
        );
    }
}