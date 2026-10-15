package com.pjsofttech.library.dto.request;

import com.pjsofttech.library.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRoleUpdateDto {
    //Admin to change somebody's role:
    @NotNull
    private Role role;
}
