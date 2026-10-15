package com.pjsofttech.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EditionResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Integer editionNumber;
    private String editionLabel;
    private Integer publicationYear;
    private LocalDate publicationDate;
    private BigDecimal price;
    private String isbn;
    private Integer totalCopies;
    private Integer availableCopies;
    private Boolean isLatest;
    private Long publisherId;
    private String publisherName;
    private LocalDateTime createdAt;
}