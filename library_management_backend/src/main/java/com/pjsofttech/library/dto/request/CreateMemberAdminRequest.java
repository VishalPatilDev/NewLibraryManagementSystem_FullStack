package com.pjsofttech.library.dto.request;

import com.pjsofttech.library.model.AcademicYear;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMemberAdminRequest {
    private String name;
//    private String membershipNumber;

    private String email;
    /*
     * Optional.
     *
     * If null/blank, backend generates a temporary password.
     */
    private String password;
    private String phone;

    private String address;
    private LocalDate dateOfBirth;

    private Long academicYearId;

//   private LocalDate membershipDate;

    private LocalDate membershipExpiryDate;
}
