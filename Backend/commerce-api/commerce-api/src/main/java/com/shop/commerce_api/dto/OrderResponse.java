package com.shop.commerce_api.dto;

import com.shop.commerce_api.entity.OrderItem;
import com.shop.commerce_api.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String userId;

    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private String country;

    private List<OrderItem> items;
    private double total;
    private OrderStatus status;
    private Instant createdAt;
}

