package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.OrderItemRequest;
import com.shop.commerce_api.dto.OrderRequest;
import com.shop.commerce_api.dto.OrderResponse;
import com.shop.commerce_api.entity.Order;
import com.shop.commerce_api.entity.OrderItem;
import com.shop.commerce_api.entity.OrderStatus;
import com.shop.commerce_api.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderPublicController {

    private final OrderRepository orderRepository;

    public OrderPublicController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // POST /api/orders  -> place order
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest request
    ) {
        String userId = authentication != null ? authentication.getName() : null;

        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        double total = items.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        Order order = Order.builder()
                .userId(userId)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .items(items)
                .total(total)
                .status(OrderStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(toOrderResponse(saved));
    }

    // GET /api/orders  -> current user’s orders
    @GetMapping
    public Page<OrderResponse> myOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String userId = authentication.getName();
        PageRequest pageable = PageRequest.of(page, size);

        return orderRepository.findByUserId(userId, pageable)
                .map(this::toOrderResponse);
    }

    private OrderItem toOrderItem(OrderItemRequest dto) {
        return new OrderItem(
                dto.getProductId(),
                dto.getTitle(),
                dto.getImage(),
                dto.getPrice(),
                dto.getQuantity()
        );
    }

    private OrderResponse toOrderResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUserId())
                .fullName(o.getFullName())
                .email(o.getEmail())
                .phone(o.getPhone())
                .address(o.getAddress())
                .city(o.getCity())
                .postalCode(o.getPostalCode())
                .country(o.getCountry())
                .items(o.getItems())
                .total(o.getTotal())
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
