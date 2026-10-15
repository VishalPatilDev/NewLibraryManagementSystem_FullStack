package com.pjsofttech.library.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublisherRequest {

    @NotBlank(message = "Publisher name is required")
    @Size(max = 150, message = "Name too long")
    private String name;

    @Size(max = 200)
    private String address;

    @Size(max = 100)
    private String website;

    @Size(max = 15)
    private String phone;

    @Email(message = "Enter a valid email")
    @Size(max = 100)
    private String email;

    @Size(max = 50)
    private String country;
}