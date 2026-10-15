package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PublisherResponse {
    private Long id;
    private String name;
    private String address;
    private String website;
    private String phone;
    private String email;
    private String country;
    private LocalDateTime createdAt;
}