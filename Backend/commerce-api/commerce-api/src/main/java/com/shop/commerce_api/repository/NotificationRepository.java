package com.shop.commerce_api.repository;

import com.shop.commerce_api.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
}
