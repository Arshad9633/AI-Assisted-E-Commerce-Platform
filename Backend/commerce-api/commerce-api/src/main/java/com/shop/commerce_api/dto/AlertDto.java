package com.shop.commerce_api.dto;

public record AlertDto(
        String level, // "INFO", "WARNING", "ERROR"
        String message
) {}
