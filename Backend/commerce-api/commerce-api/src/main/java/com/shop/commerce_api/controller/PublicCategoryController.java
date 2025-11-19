package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.CategoryResponse;
import com.shop.commerce_api.entity.Category;
import com.shop.commerce_api.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
public class PublicCategoryController {

    private final CategoryRepository categoryRepo;

    public PublicCategoryController(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> listCategories() {
        return categoryRepo.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.getGender()      // enum serialized as string
        );
    }
}
