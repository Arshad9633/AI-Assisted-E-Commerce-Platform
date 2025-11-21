package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.CartItemRequest;
import com.shop.commerce_api.dto.CartResponse;
import com.shop.commerce_api.dto.CartUpdateRequest;
import com.shop.commerce_api.entity.Cart;
import com.shop.commerce_api.entity.CartItem;
import com.shop.commerce_api.repository.CartRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;

    public CartController(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();

        Cart cart = cartRepository.findByUserId(userId).orElse(null);

        if (cart == null) {
            return ResponseEntity.ok(
                    CartResponse.builder()
                            .items(Collections.emptyList())
                            .total(0.0)
                            .updatedAt(Instant.now())
                            .build()
            );
        }

        return ResponseEntity.ok(toResponse(cart));
    }

    @PutMapping
    public ResponseEntity<CartResponse> upsertCart(
            Authentication authentication,
            @Valid @RequestBody CartUpdateRequest request
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();

        List<CartItem> items = request.getItems().stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder().userId(userId).build());

        cart.setItems(items);
        cart.setUpdatedAt(Instant.now());

        Cart saved = cartRepository.save(cart);

        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        cartRepository.findByUserId(userId).ifPresent(cartRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private CartItem toEntity(CartItemRequest dto) {
        return new CartItem(
                dto.getProductId(),
                dto.getTitle(),
                dto.getImage(),
                dto.getPrice(),
                dto.getQuantity()
        );
    }

    private CartResponse toResponse(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        return CartResponse.builder()
                .items(cart.getItems())
                .total(total)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
