package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class BookResponse {
    private Long id;
    private String title;
    private String isbn;
    private String description;
    private Integer publicationYear;
    private String language;
    private PublisherResponse publisher;
    private Integer totalCopies;
    private Integer availableCopies;
    private CategoryResponse category;
    private Set<AuthorResponse> authors;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}