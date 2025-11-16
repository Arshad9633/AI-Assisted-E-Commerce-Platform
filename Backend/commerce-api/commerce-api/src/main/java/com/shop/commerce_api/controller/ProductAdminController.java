package com.shop.commerce_api.controller;

import com.shop.commerce_api.entity.Product;
import com.shop.commerce_api.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final ProductRepository productRepo;

    public ProductAdminController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@RequestBody @Valid Product p) {
        validateProduct(p, true);
        p.setCreatedAt(Instant.now());
        p.setUpdatedAt(Instant.now());
        return productRepo.save(p);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable String id, @RequestBody @Valid Product p) {
        Product existing = productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // If slug changes, ensure uniqueness
        if (!existing.getSlug().equals(p.getSlug()) && productRepo.existsBySlug(p.getSlug())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already exists");
        }

        // copy allowed fields
        existing.setTitle(p.getTitle());
        existing.setSlug(p.getSlug());
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
        return productRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepo.deleteById(id);
    }

    private void validateProduct(Product p, boolean creating) {
        if (p.getDiscountPrice() != null && p.getPrice() != null &&
                p.getDiscountPrice().compareTo(p.getPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "discountPrice cannot be greater than price");
        }
        if (creating && productRepo.existsBySlug(p.getSlug())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already exists");
        }
        if (p.getStock() != null && p.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }
        if (p.getStatus() == null ||
                !(p.getStatus().equals("DRAFT") || p.getStatus().equals("PUBLISHED") || p.getStatus().equals("ARCHIVED"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
    }
}
