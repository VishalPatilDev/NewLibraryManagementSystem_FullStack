package com.pjsofttech.library.dto.response;

import com.pjsofttech.library.model.MemberStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AdminMemberRegistrationResponse {

    private Long userId;

    private Long memberId;

    private String name;

    private String email;

    private String membershipNumber;

    private String phone;

    private String address;

    private Long academicYearId;

    private String academicYear;

    private LocalDate membershipDate;

    private LocalDate membershipExpiryDate;

    private MemberStatus status;

    /*
     * This should only be returned during creation.
     */
    private String temporaryPassword;
}
