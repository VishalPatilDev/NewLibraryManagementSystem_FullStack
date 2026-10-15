package com.pjsofttech.library.controller;

import com.pjsofttech.library.service.DashboardService;
import com.pjsofttech.library.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pjsofttech/library/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Library statistics and overview")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Operation(summary = "Get library dashboard statistics (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched",
                dashboardService.getStats()));
    }
}