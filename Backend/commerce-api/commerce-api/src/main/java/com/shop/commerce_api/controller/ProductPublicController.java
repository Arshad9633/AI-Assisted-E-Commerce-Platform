package com.shop.commerce_api.controller;

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

    // ----------------------------
    // 1. Public Product List (search + paging)
    // ----------------------------
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

        Page<Product> products = search.isBlank()
                ? productRepo.findByStatus("PUBLISHED", pageable)
                : productRepo.searchPublished(search.trim(), pageable);

        List<Product> filtered = products.stream()
                .filter(p -> matchCategoryGender(p, gender, categoryId))
                .toList();

        return new PageImpl<>(filtered, pageable, filtered.size())
                .map(this::toProductResponse);
    }

    // ----------------------------
    // 2. Product Details by Slug
    // ----------------------------
    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> get(@PathVariable String slug) {
        // 🔐 Keep status filter, but make sure repo has this method
        return productRepo.findBySlugAndStatus(slug, "PUBLISHED")
                .map(p -> ResponseEntity.ok(toProductResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ----------------------------
    // 3. Filter Products by Gender + Category Name
    //    (used by /products/:gender/:categorySlug)
    // ----------------------------
    @GetMapping("/by-category")
    public ResponseEntity<List<ProductResponse>> filterProducts(
            @RequestParam String gender,
            @RequestParam String category
    ) {
        Gender genderEnum;
        try {
            genderEnum = Gender.valueOf(gender.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        // case-insensitive search by category name + gender
        List<Category> categories =
                categoryRepo.searchCategoryByNameContains(category, genderEnum);

        if (categories.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        Category cat = categories.get(0);

        List<Product> products =
                productRepo.findByCategoryAndStatus(cat.getId(), "PUBLISHED");

        List<ProductResponse> response =
                products.stream().map(this::toProductResponse).toList();

        return ResponseEntity.ok(response);
    }


    // ----------------------------
    // Helpers
    // ----------------------------
    private boolean matchCategoryGender(Product p, Gender gender, String categoryId) {
        if (categoryId == null && gender == null) return true;

        Optional<Category> catOpt =
                (p.getCategory() == null) ? Optional.empty() : categoryRepo.findById(p.getCategory());

        if (catOpt.isEmpty()) return false;

        Category cat = catOpt.get();

        if (categoryId != null && !cat.getId().equals(categoryId)) return false;
        if (gender != null && cat.getGender() != gender) return false;

        return true;
    }

    private PageRequest buildPageable(int page, int limit, String sort) {
        try {
            String[] parts = sort.split(":");
            String field = parts[0];
            Sort.Direction direction =
                    (parts.length > 1 && "asc".equalsIgnoreCase(parts[1]))
                            ? Sort.Direction.ASC
                            : Sort.Direction.DESC;

            return PageRequest.of(page, limit, Sort.by(direction, field));
        } catch (Exception e) {
            return PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
    }

    private ProductResponse toProductResponse(Product p) {
        Optional<Category> catOpt =
                (p.getCategory() == null)
                        ? Optional.empty()
                        : categoryRepo.findById(p.getCategory());

        List<ProductImageDto> images =
                (p.getImages() == null)
                        ? List.of()
                        : p.getImages().stream()
                        .map(img -> new ProductImageDto(img.getUrl(), img.getAlt()))
                        .toList();

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
                .categoryId(catOpt.map(Category::getId).orElse(null))
                .categoryName(catOpt.map(Category::getName).orElse(null))
                .categoryGender(catOpt.map(Category::getGender).orElse(null))
                .build();
    }
}
