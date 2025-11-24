package com.shop.commerce_api.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document("orders")
public class Order {

    @Id
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

    @CreatedDate
    private Instant createdAt;

}
