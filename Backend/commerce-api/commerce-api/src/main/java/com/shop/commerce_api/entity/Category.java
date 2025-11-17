package com.shop.commerce_api.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;



@Data
@Document("categories")
public class Category {

    @Id
    private String id;

    @NotBlank
    @Indexed(name = "idx_category_name")
    private String name;

    @NotNull
    private Gender gender;

    public Category() {}

    public Category(String name, Gender gender){
        this.name = name;
        this.gender = gender;
    }
}
