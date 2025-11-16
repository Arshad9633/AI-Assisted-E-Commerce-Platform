package com.shop.commerce_api.controller;

import com.shop.commerce_api.entity.Product;
import com.shop.commerce_api.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/products")
public class ProductPublicController {

    private final ProductRepository productRepo;

    public ProductPublicController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @GetMapping
    public Page<Product> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "createdAt:desc") String sort
    ) {
        // sort format: field:dir
        String[] parts = sort.split(":", 2);
        String field = parts[0];
        Sort.Direction dir = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pr = PageRequest.of(page, limit, Sort.by(dir, field));

        if (search != null && !search.isBlank()) {
            return productRepo.searchPublished(search.trim(), pr);
        }
        // Only published products
        return productRepo.findByStatus("PUBLISHED", pr);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Product> get(@PathVariable String slug) {
        return productRepo.findBySlugAndStatus(slug, "PUBLISHED")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}