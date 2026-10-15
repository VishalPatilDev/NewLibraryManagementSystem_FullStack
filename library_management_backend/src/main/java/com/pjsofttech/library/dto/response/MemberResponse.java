package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.AcademicYear;
import com.pjsofttech.library.model.MemberStatus;
import com.pjsofttech.library.model.MemberType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MemberResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String membershipNumber;
    private String phone;
    private String address;
    private AcademicYear academicYear;
    private LocalDate membershipDate;
    private LocalDate membershipExpiryDate;
    private MemberStatus status;
    private MemberType memberType;
    private LocalDateTime createdAt;
}