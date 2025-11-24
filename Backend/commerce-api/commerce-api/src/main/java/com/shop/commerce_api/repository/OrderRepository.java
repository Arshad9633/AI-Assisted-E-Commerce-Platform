package com.shop.commerce_api.repository;

import com.shop.commerce_api.entity.Order;
import com.shop.commerce_api.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    long countByStatus(OrderStatus status);

    long countByStatusAndCreatedAtBetween(
            OrderStatus status,
            Instant start,
            Instant end
    );

    List<Order> findTop10ByOrderByCreatedAtDesc();

    List<Order> findByStatusAndCreatedAtBetween(
            OrderStatus status,
            Instant start,
            Instant end
    );

    // 🔹 new: all orders in time range (any status)
    List<Order> findByCreatedAtBetween(Instant start, Instant end);

    // 🔹 new: all orders in time range except a given status
    List<Order> findByCreatedAtBetweenAndStatusNot(
            Instant start,
            Instant end,
            OrderStatus status
    );

    Page<Order> findByUserId(String userId, Pageable pageable);
}
