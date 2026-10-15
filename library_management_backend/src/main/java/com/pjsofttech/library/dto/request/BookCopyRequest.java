package com.pjsofttech.library.dto.request;

import com.pjsofttech.library.model.CopyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookCopyRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotBlank(message = "Barcode is required")
    private String barcode;

    private CopyStatus status = CopyStatus.AVAILABLE;
    private Long rackId;

    private String shelfLocation;

    private LocalDate purchaseDate;
}