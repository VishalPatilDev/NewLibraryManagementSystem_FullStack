package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WaiveFineRequest {

    @NotBlank(message = "Waive reason is required")
    private String reason;
}