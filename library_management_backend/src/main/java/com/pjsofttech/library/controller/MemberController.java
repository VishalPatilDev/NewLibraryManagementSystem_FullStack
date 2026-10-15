package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.CreateMemberAdminRequest;
import com.pjsofttech.library.dto.request.MemberRequest;
import com.pjsofttech.library.model.MemberStatus;
import com.pjsofttech.library.model.MemberType;
import com.pjsofttech.library.service.MemberService;
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
@RequestMapping("/pjsofttech/library/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "Library member management")
@SecurityRequirement(name = "bearerAuth")
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Register a user as a library member (ADMIN/LIBRARIAN)")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody CreateMemberAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member registered successfully", memberService.registerMember(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Get all members (paginated)")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Members fetched",
                memberService.getAll(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Get member by ID")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Member fetched", memberService.getById(id)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Get member by User ID")
    public ResponseEntity<ApiResponse<?>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Member fetched", memberService.getByUserId(userId)));
    }

    @GetMapping("/number/{membershipNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Get member by membership number")
    public ResponseEntity<ApiResponse<?>> getByMembershipNumber(@PathVariable String membershipNumber) {
        return ResponseEntity.ok(ApiResponse.success("Member fetched",
                memberService.getByMembershipNumber(membershipNumber)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Search members by name, email, or membership number")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                memberService.search(keyword, PageRequest.of(page, size))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Update member info")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id, @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Member updated", memberService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Update member status: ACTIVE, BLOCKED, EXPIRED")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestParam MemberStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Member status updated",
                memberService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/type")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Update member type: STUDENT,\n" +
            "    TEACHER,\n" +
            "    STAFF,\n" +
            "    PARENT")
    public ResponseEntity<ApiResponse<?>> updateType(
            @PathVariable Long id,
            @RequestParam MemberType memberType) {
        return ResponseEntity.ok(ApiResponse.success("Member type updated",
                memberService.updateType(id, memberType)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete member (ADMIN only)")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Member deleted"));
    }
}