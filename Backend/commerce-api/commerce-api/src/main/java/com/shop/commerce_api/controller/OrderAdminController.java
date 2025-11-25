package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.OrderResponse;
import com.shop.commerce_api.entity.Notification;
import com.shop.commerce_api.entity.Order;
import com.shop.commerce_api.entity.OrderItem;
import com.shop.commerce_api.entity.OrderStatus;
import com.shop.commerce_api.entity.Product;
import com.shop.commerce_api.repository.NotificationRepository;
import com.shop.commerce_api.repository.OrderRepository;
import com.shop.commerce_api.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class OrderAdminController {

    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final ProductRepository productRepository;

    public OrderAdminController(OrderRepository orderRepository,
                                NotificationRepository notificationRepository,
                                ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public Page<OrderResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        return orderRepository.findAll(pageable)
                .map(this::toOrderResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable String id) {
        return orderRepository.findById(id)
                .map(o -> ResponseEntity.ok(toOrderResponse(o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status
    ) {
        return orderRepository.findById(id)
                .map(order -> {

                    OrderStatus oldStatus = order.getStatus();

                    // ✅ Decrease stock once, when moving from PENDING to PAID or SHIPPED
                    boolean shouldDecreaseStock =
                            (oldStatus == OrderStatus.PENDING) &&
                                    (status == OrderStatus.PAID || status == OrderStatus.SHIPPED);

                    if (shouldDecreaseStock && order.getItems() != null) {
                        for (OrderItem item : order.getItems()) {

                            productRepository.findById(item.getProductId())
                                    .ifPresent(product -> {
                                        Integer currentStock = product.getStock();
                                        int safeCurrentStock = (currentStock != null) ? currentStock : 0;

                                        int newStock = Math.max(0, safeCurrentStock - item.getQuantity());
                                        product.setStock(newStock);
                                        productRepository.save(product);
                                    });
                        }
                    }

                    // Update status
                    order.setStatus(status);
                    Order saved = orderRepository.save(order);

                    // create notification
                    Notification notification = Notification.builder()
                            .userEmail(order.getEmail())
                            .message("Your order #" + order.getId() + " is now " + status)
                            .read(false)
                            .createdAt(Instant.now())
                            .build();
                    notificationRepository.save(notification);

                    return ResponseEntity.ok(toOrderResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
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
