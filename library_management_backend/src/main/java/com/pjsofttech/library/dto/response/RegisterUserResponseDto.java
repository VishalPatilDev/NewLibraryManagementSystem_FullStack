package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.Permissions;
import com.pjsofttech.library.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class RegisterUserResponseDto {
    private Long id;
    private String name;
    private String email;
    private LocalDate dateOfBirth;
    private Role role;
    private LocalDateTime createdAt;
    private boolean active;
    private Set<Permissions> permissions;
}
