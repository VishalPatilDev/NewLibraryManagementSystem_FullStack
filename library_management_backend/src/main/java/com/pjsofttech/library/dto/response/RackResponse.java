package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RackResponse {
    private Long id;
    private String rackCode;
    private String label;
    private String section;
    private String floorSection;

    private Integer rowNumber;
    private Integer totalCapacity;
    private Long currentBookCount;
    private Long availableCapacity;
    private Double occupancyPercentage;
    private List<BookCopyResponse> bookCopyResponses;
    private String description;
    private LocalDateTime createdAt;
}