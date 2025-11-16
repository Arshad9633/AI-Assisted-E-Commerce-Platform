package com.shop.commerce_api.repository;

import com.shop.commerce_api.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findBySlugAndStatus(String slug, String status);

    Page<Product> findByStatus(String status, Pageable pageable);

    @Query("{ 'status': 'PUBLISHED', '$or': [" +
            "  { 'title': { $regex: ?0, $options: 'i' } }," +
            "  { 'description': { $regex: ?0, $options: 'i' } }," +
            "  { 'category': { $regex: ?0, $options: 'i' } }," +
            "  { 'tags': { $elemMatch: { $regex: ?0, $options: 'i' } } }" +
            "] }")
    Page<Product> searchPublished(String q, Pageable pageable);

    boolean existsBySlug(String slug);
}

