package com.shop.commerce_api.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank
    private String name;
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 6, max = 100)
    private String password;
}
