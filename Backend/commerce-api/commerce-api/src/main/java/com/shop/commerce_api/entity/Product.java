package com.shop.commerce_api.entity;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document("products")
public class Product {

    @Id
    private String id;

    @NotBlank
    private String title;

    @NotBlank
    private String slug; // must be unique

    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal discountPrice; // nullable

    @NotBlank
    private String currency = "EUR";

    @NotNull
    @Min(0)
    private Integer stock = 0;

    /** DRAFT | PUBLISHED | ARCHIVED */
    @NotBlank
    private String status = "DRAFT";

    private List<Image> images = new ArrayList<>();

    private String category;
    private List<String> tags = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    public static class Image {
        private String url;
        private String alt;
    }
}
