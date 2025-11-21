package com.shop.commerce_api.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    private String productId;
    private String title;
    private String image;
    private double price;
    private int quantity;
}

