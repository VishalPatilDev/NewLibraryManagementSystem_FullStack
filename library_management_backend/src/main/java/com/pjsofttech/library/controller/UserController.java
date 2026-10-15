package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.*;
import com.pjsofttech.library.model.User;
import com.pjsofttech.library.repository.UserRepository;
import com.pjsofttech.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library/user")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;


    // ADMIN / LIBRARIAN - CREATE MEMBER
    @PreAuthorize("hasAuthority('USER_CREATE')")
    @PostMapping("/member")
    public ResponseEntity<?> registerMember(
            @RequestBody CreateMemberAdminRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.registerMember(request));
    }


    // ADMIN / LIBRARIAN - GET ALL USERS
    @PreAuthorize("hasAuthority('USER_READ')")
    @GetMapping("/paginated")
    public ResponseEntity<?> fetchAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.fetchUsers(PageRequest.of(page, size, sort)));
    }
    // ADMIN / LIBRARIAN - GET ALL USERS
    @PreAuthorize("hasAuthority('USER_READ')")
    @GetMapping()
    public ResponseEntity<?> fetchAllUsers(
    ){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.fetchUsers());
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @GetMapping("{id}")
    public ResponseEntity<?> fetchUserById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.fetchUserById(id));
    }

    // ADMIN / LIBRARIAN - UPDATE USER
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @PutMapping("{id}")
    public ResponseEntity<?> updateUserById(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDto updateUserRequestDto){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.updateUserById(id,updateUserRequestDto));
    }


    @PutMapping("/changePassword/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @Valid @RequestBody ChangePasswordRequestDto changePasswordRequestDto){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.changePassword(id,changePasswordRequestDto));
    }

    // ADMIN ONLY - DELETE USER
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.deleteUser(id));
    }


    // ADMIN - CHANGE ROLE
    @PreAuthorize("hasAuthority('USER_MANAGE_ROLE')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateDto dto) {

        return ResponseEntity.ok(
                userService.updateUserRole(id, dto)
        );
    }
    // ADMIN/LIBRARIAN - CHANGE STATUS
    @PreAuthorize("hasAuthority('USER_MANAGE_STATUS')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDto dto) {

        return ResponseEntity.ok(
                userService.updateUserStatus(id, dto)
        );
    }


    //********************************************//
    //For Current LoggedIn User Operations//
    //*********************************************//

    // GET CURRENT LOGGED-IN USER
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication) {
        System.out.println("Authentication = " + authentication);

        if (authentication != null) {
            System.out.println("Principal = " + authentication.getPrincipal());
            System.out.println("Name = " + authentication.getName());
            System.out.println("Authorities = " + authentication.getAuthorities());
            System.out.println("Authenticated = " + authentication.isAuthenticated());
        }
        String email = authentication.getName();
        // user was auto-created in the filter if missing
        return ResponseEntity.ok(
                userService.getCurrentUser(email)
        );
    }

    //Update Current User
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, UpdateUserRequestDto updateUserRequestDto){
        String email = authentication.getName();
        User loggedInUser = getUserByEmail(email);
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.updateCurrentUser(loggedInUser,updateUserRequestDto));
    }

    //Change Password Of Current User
    @PutMapping("/me/changePassword")
    public ResponseEntity<?> changePassword(Authentication authentication,@Valid @RequestBody ChangePasswordRequestDto changePasswordRequestDto){
        String email = authentication.getName();
        User loggedInUser = getUserByEmail(email);
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.changePassword(loggedInUser,changePasswordRequestDto));
    }


    //Helper Methods
    private  User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));
    }
}
