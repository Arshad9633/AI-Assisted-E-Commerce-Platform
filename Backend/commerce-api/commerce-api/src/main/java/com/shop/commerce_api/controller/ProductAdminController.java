package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.CategoryCreateRequest;
import com.shop.commerce_api.dto.CategoryResponse;
import com.shop.commerce_api.dto.ProductImageDto;
import com.shop.commerce_api.dto.ProductResponse;
import com.shop.commerce_api.entity.Category;
import com.shop.commerce_api.entity.Product;
import com.shop.commerce_api.repository.CategoryRepository;
import com.shop.commerce_api.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/catalog")
@PreAuthorize("hasRole('ADMIN')")
public class ProductAdminController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public ProductAdminController(
            CategoryRepository categoryRepository,
            ProductRepository productRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    /* ================================
                 CATEGORIES
       ================================ */

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestBody @Valid CategoryCreateRequest request
    ) {
        if (categoryRepository.existsByNameIgnoreCaseAndGender(request.getName(), request.getGender())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category already exists for this gender");
        }

        Category saved = categoryRepository.save(
                new Category(request.getName(), request.getGender())
        );

        return ResponseEntity.created(
                URI.create("/api/admin/catalog/categories/" + saved.getId())
        ).body(new CategoryResponse(saved.getId(), saved.getName(), saved.getGender()));
    }

    @GetMapping("/categories")
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getGender()))
                .collect(Collectors.toList());
    }

    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(
            @PathVariable String id,
            @RequestBody @Valid CategoryCreateRequest request
    ) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        // check if another category (different id) already has same name + gender
        Category duplicate = categoryRepository
                .findByNameIgnoreCaseAndGender(request.getName(), request.getGender());

        if (duplicate != null && !duplicate.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category already exists for this gender");
        }

        existing.setName(request.getName());
        existing.setGender(request.getGender());

        Category saved = categoryRepository.save(existing);

        return new CategoryResponse(saved.getId(), saved.getName(), saved.getGender());
    }


    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
    }


    /* ================================
                 PRODUCTS
       ================================ */

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody @Valid Product p
    ) {
        if (p.getCategory() == null || !categoryRepository.existsById(p.getCategory())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found");
        }

        if (productRepository.existsBySlug(p.getSlug())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already exists");
        }

        validateProduct(p, true);

        Instant now = Instant.now();
        p.setCreatedAt(now);
        p.setUpdatedAt(now);

        Product saved = productRepository.save(p);

        return ResponseEntity.created(
                URI.create("/api/admin/catalog/products/" + saved.getId())
        ).body(toProductResponse(saved));
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(
            @PathVariable String id,
            @RequestBody @Valid Product p
    ) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (p.getSlug() != null &&
                !existing.getSlug().equals(p.getSlug()) &&
                productRepository.existsBySlug(p.getSlug())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already exists");
        }

        if (p.getCategory() != null &&
                !categoryRepository.existsById(p.getCategory())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found");
        }

        if (p.getTitle() != null) existing.setTitle(p.getTitle());
        if (p.getSlug() != null) existing.setSlug(p.getSlug());
        existing.setDescription(p.getDescription());
        existing.setPrice(p.getPrice());
        existing.setDiscountPrice(p.getDiscountPrice());
        existing.setCurrency(p.getCurrency());
        existing.setStock(p.getStock());
        existing.setStatus(p.getStatus());
        existing.setImages(p.getImages());
        existing.setCategory(p.getCategory());
        existing.setTags(p.getTags());
        existing.setUpdatedAt(Instant.now());

        validateProduct(existing, false);

        return toProductResponse(productRepository.save(existing));
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

    @GetMapping("/products")
    public Map<String, Object> listProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Product> pageResult = productRepository.findAll(pageable);

        List<ProductResponse> items = pageResult.getContent()
                .stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("totalItems", pageResult.getTotalElements());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("currentPage", pageResult.getNumber());
        response.put("pageSize", pageResult.getSize());

        return response;
    }




    /* ================================
              HELPER METHODS
       ================================ */

    private ProductResponse toProductResponse(Product p) {
        Optional<Category> cat = Optional.empty();
        if (p.getCategory() != null) {
            cat = categoryRepository.findById(p.getCategory());
        }

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
                .images(
                        p.getImages() == null ? List.of()
                                : p.getImages().stream()
                                .map(i -> new ProductImageDto(i.getUrl(), i.getAlt()))
                                .collect(Collectors.toList())
                )
                .tags(p.getTags())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .categoryId(cat.map(Category::getId).orElse(null))
                .categoryName(cat.map(Category::getName).orElse(null))
                .categoryGender(cat.map(Category::getGender).orElse(null))
                .build();
    }

    private void validateProduct(Product p, boolean creating) {
        if (creating && (p.getSlug() == null || p.getSlug().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug required");
        }

        if (p.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price required");
        }

        if (p.getDiscountPrice() != null &&
                p.getDiscountPrice().compareTo(p.getPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount cannot exceed price");
        }

        if (p.getStock() != null && p.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }

        if (p.getStatus() == null ||
                !(p.getStatus().equals("DRAFT") ||
                        p.getStatus().equals("PUBLISHED") ||
                        p.getStatus().equals("ARCHIVED"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product status");
        }
    }
}
