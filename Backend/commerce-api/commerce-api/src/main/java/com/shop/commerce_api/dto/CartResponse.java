package com.shop.commerce_api.dto;

import com.shop.commerce_api.entity.CartItem;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class CartResponse {

    private List<CartItem> items;
    private double total;
    private Instant updatedAt;
}

