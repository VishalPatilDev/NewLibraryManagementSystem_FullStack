package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.RackRequest;
import com.pjsofttech.library.service.RackService;
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
@RequestMapping("/pjsofttech/library/racks")
@RequiredArgsConstructor
@Tag(
        name = "Racks",
        description = "Library rack management — manage rack locations and book capacity"
)
@SecurityRequirement(name = "bearerAuth")
public class RackController {

    private final RackService rackService;

    @PostMapping
    @PreAuthorize("hasAuthority('RACK_CREATE')")
    @Operation(summary = "Create a new rack (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> create(
            @Valid @RequestBody RackRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Rack created",
                        rackService.create(request)
                ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RACK_READ')")
    @Operation(summary = "Get rack by ID")
    public ResponseEntity<ApiResponse<?>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Rack fetched",
                        rackService.getById(id)
                )
        );
    }

    @GetMapping
    @PreAuthorize("hasAuthority('RACK_READ')")
    @Operation(summary = "Get all racks")
    public ResponseEntity<ApiResponse<?>> getAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Racks fetched",
                        rackService.getAll()
                )
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('RACK_READ')")
    @Operation(summary = "Search racks by keyword")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Racks fetched",
                        rackService.search(keyword)
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RACK_UPDATE')")
    @Operation(summary = "Update rack (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id,
            @Valid @RequestBody RackRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Rack updated",
                        rackService.update(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RACK_DELETE')")
    @Operation(summary = "Delete rack — only allowed if it contains no book copies (ADMIN)")
    public ResponseEntity<ApiResponse<?>> delete(
            @PathVariable Long id) {

        rackService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>success("Rack deleted")
        );
    }
}