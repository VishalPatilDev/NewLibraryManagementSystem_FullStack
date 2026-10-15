package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.CopyStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookCopyResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String barcode;
//    private RackResponse rackResponse;
    private Long rackId;
    private String rackCode;
    private CopyStatus status;

    private String shelfLocation;
    private LocalDate purchaseDate;
    private LocalDateTime createdAt;
}