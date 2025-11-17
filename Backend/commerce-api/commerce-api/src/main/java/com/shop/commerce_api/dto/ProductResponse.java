package com.shop.commerce_api.dto;

import com.shop.commerce_api.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private String id;

    private String title;
    private String slug;
    private String description;

    private BigDecimal price;
    private BigDecimal discountPrice;
    private String currency;

    private Integer stock;

    private String status;

    @Builder.Default
    private List<ProductImageDto> images = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    private String categoryId;
    private String categoryName;
    private Gender categoryGender;
}
