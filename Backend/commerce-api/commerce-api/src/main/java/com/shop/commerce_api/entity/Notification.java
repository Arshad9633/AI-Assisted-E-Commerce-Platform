package com.shop.commerce_api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document("notifications")
public class Notification {

    @Id
    private String id;

    private String userEmail;
    private String message;
    private boolean read;
    private Instant createdAt;
}
