package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MemberRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 15)
    private String phone;

    @Size(max = 300)
    private String address;

    private LocalDate membershipExpiryDate;

    private Long academicYearId;
}