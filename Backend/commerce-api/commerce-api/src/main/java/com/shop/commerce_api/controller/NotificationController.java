package com.shop.commerce_api.controller;

import com.shop.commerce_api.entity.Notification;
import com.shop.commerce_api.repository.NotificationRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // GET user notifications
    @GetMapping
    public List<Notification> getNotifications(
            @AuthenticationPrincipal(expression = "username") String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @PostMapping("/read")
    public String markAllRead(
            @AuthenticationPrincipal(expression = "username") String email) {
        List<Notification> list = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        return "OK";
    }

    @DeleteMapping
    public String clearAll(@AuthenticationPrincipal(expression = "username") String email) {
        notificationRepository.deleteByUserEmail(email);
        return "OK";
    }

}
