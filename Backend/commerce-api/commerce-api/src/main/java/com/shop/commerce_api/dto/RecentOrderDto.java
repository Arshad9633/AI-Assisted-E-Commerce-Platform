package com.shop.commerce_api.dto;

import java.time.Instant;

public record RecentOrderDto(
        String id,
        String userName,
        String userEmail,
        Double amount,
        com.shop.commerce_api.entity.OrderStatus status,
        Instant createdAt
) {}
