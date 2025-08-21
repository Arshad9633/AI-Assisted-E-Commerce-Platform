package com.shop.commerce_api.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class HomeController {

    @GetMapping
    public ResponseEntity<?> publicHome() {
        return ResponseEntity.ok(
                new Msg("Welcome visitor. This page is public.")
        );
    }

    @GetMapping("/user")
    public ResponseEntity<?> userHome(Authentication auth){
        return ResponseEntity.ok(
                new Msg("Hello " + auth.getName() + ". You have user access.")
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<?> adminHome(Authentication auth) {
        return ResponseEntity.ok(
                new Msg("Admin " + auth.getName() + ". You have admin access.")
        );
    }

    // <--- This is what defines Msg, so your IDE/compiler can resolve it
    record Msg(String message) {}
}
