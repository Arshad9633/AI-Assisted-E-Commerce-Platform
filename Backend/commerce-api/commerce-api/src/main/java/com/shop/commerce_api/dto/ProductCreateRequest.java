package com.shop.commerce_api.dto;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductCreateRequest {

    @NotBlank
    private String categoryId;

    @NotBlank
    private String title;

    private String slug;

    private String description;

    @NotBlank
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal discountPrice;

    @NotBlank
    private String currency = "EUR";

    @NotNull
    @Min(0)
    private Integer stock = 0;


    private String status = "DRAFT";


    @Builder.Default
    private List<ProductImageDto> images = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}

