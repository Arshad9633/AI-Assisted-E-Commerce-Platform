package com.shop.commerce_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderItemRequest {

    @NotBlank
    private String productId;

    @NotBlank
    private String title;

    private String image;

    @Positive
    private double price;

    @Min(1)
    private int quantity;
}
