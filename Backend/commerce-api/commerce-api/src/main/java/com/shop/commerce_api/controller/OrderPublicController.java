package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.OrderItemRequest;
import com.shop.commerce_api.dto.OrderRequest;
import com.shop.commerce_api.dto.OrderResponse;
import com.shop.commerce_api.entity.Order;
import com.shop.commerce_api.entity.OrderItem;
import com.shop.commerce_api.entity.OrderStatus;
import com.shop.commerce_api.entity.User;
import com.shop.commerce_api.repository.OrderRepository;
import com.shop.commerce_api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderPublicController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderPublicController(OrderRepository orderRepository,
                                 UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // POST /api/orders  -> place order
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest request
    ) {
        String userId = null;

        // Resolve logged-in user and store their Mongo _id in the order
        if (authentication != null) {
            String email = authentication.getName();  // principal = email (from your JWT setup)
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }

        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        double total = items.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        Order order = Order.builder()
                .userId(userId)                          // ✅ now a real User.id, not email
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .items(items)
                .total(total)
                .status(OrderStatus.PENDING)             // stays PENDING until admin sets PAID/SHIPPED
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
        PageRequest pageable = PageRequest.of(page, size);

        if (authentication == null) {
            // not logged in -> no user-specific orders
            return Page.empty(pageable);
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Page.empty(pageable);
        }

        String userId = userOpt.get().getId();

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
