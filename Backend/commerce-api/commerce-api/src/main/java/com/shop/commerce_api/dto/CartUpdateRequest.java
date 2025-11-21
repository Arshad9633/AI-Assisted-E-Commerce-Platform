package com.shop.commerce_api.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CartUpdateRequest {

    // allow empty list to represent "clear cart"
    private List<CartItemRequest> items = new ArrayList<>();
}
