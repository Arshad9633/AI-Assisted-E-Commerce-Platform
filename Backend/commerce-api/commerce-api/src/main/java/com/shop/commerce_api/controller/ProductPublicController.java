package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.CategoryResponse;
import com.shop.commerce_api.dto.ProductImageDto;
import com.shop.commerce_api.dto.ProductResponse;
import com.shop.commerce_api.entity.Category;
import com.shop.commerce_api.entity.Gender;
import com.shop.commerce_api.entity.Product;
import com.shop.commerce_api.repository.CategoryRepository;
import com.shop.commerce_api.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductPublicController {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    public ProductPublicController(ProductRepository productRepo,
                                   CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    /**
     * LIST PRODUCTS (Public)
     * Supports:
     *  - search
     *  - gender (MEN / WOMEN)
     *  - categoryId
     *  - pagination
     *  - sorting (createdAt:desc)
     */
    @GetMapping
    public Page<ProductResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "createdAt:desc") String sort
    ) {
        PageRequest pageable = buildPageable(page, limit, sort);

        // ---- SEARCH ----
        Page<Product> products;

        if (search != null && !search.isBlank()) {
            products = productRepo.searchPublished(search.trim(), pageable);
        } else {
            products = productRepo.findByStatus("PUBLISHED", pageable);
        }

        // ---- FILTER: Gender & Category ----
        List<Product> filtered = products.stream()
                .filter(p -> matchCategoryGender(p, gender, categoryId))
                .collect(Collectors.toList());

        Page<Product> finalPage = new PageImpl<>(filtered, pageable, filtered.size());

        return finalPage.map(this::toProductResponse);
    }

    /**
     * GET PRODUCT BY SLUG
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> get(@PathVariable String slug) {
        return productRepo.findBySlugAndStatus(slug, "PUBLISHED")
                .map(p -> ResponseEntity.ok(toProductResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ----------------- Helpers -----------------

    private boolean matchCategoryGender(Product p, Gender gender, String categoryId) {

        if (categoryId == null && gender == null) {
            return true;
        }

        Optional<Category> categoryOpt = (p.getCategory() == null)
                ? Optional.empty()
                : categoryRepo.findById(p.getCategory());

        if (categoryOpt.isEmpty()) return false;

        Category cat = categoryOpt.get();

        if (categoryId != null && !categoryId.equals(cat.getId())) return false;
        if (gender != null && gender != cat.getGender()) return false;

        return true;
    }

    private PageRequest buildPageable(int page, int limit, String sort) {
        try {
            String[] parts = sort.split(":", 2);
            String field = parts[0];
            Sort.Direction dir = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1]))
                    ? Sort.Direction.ASC : Sort.Direction.DESC;

            return PageRequest.of(page, limit, Sort.by(dir, field));
        } catch (Exception e) {
            return PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
    }

    private ProductResponse toProductResponse(Product p) {
        Optional<Category> categoryOpt =
                (p.getCategory() == null) ? Optional.empty() : categoryRepo.findById(p.getCategory());

        String catId = categoryOpt.map(Category::getId).orElse(null);
        String catName = categoryOpt.map(Category::getName).orElse(null);
        Gender catGender = categoryOpt.map(Category::getGender).orElse(null);

        List<ProductImageDto> images = p.getImages() == null ? List.of()
                : p.getImages().stream()
                .map(img -> new ProductImageDto(img.getUrl(), img.getAlt()))
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .currency(p.getCurrency())
                .stock(p.getStock())
                .status(p.getStatus())
                .images(images)
                .tags(p.getTags())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .categoryId(catId)
                .categoryName(catName)
                .categoryGender(catGender)
                .build();
    }
}
