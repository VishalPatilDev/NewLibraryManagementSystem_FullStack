package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuthorResponse {
    private Long id;
    private String name;
    private String biography;
    private String nationality;
    private LocalDateTime createdAt;
}