package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private String membershipNumber;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private LocalDate reservationDate;
    private LocalDate expiryDate;
    private ReservationStatus status;
    private LocalDateTime createdAt;
}