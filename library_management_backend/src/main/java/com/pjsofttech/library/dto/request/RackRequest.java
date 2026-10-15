package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RackRequest {

    @NotBlank(message = "Rack code is required")
    @Size(max = 20, message = "Rack code too long")
    private String rackCode;

    @NotBlank(message = "Label is required")
    @Size(max = 100)
    private String label;

    @Size(max = 100)
    private String section;
    private String floorSection;


    private Integer rowNumber;

    private Integer totalCapacity;

    @Size(max = 300)
    private String description;
}