package com.shop.commerce_api.repository;


import com.shop.commerce_api.entity.Category;
import com.shop.commerce_api.entity.Gender;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends MongoRepository <Category, String>{
    List<Category> findByGender(Gender gender);

    boolean existsByNameIgnoreCase(String name);
}
