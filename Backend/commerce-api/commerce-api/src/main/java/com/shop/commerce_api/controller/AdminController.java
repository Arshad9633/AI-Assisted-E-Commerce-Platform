package com.shop.commerce_api.controller;


import com.shop.commerce_api.entity.ERole;
import com.shop.commerce_api.entity.Role;
import com.shop.commerce_api.entity.User;
import com.shop.commerce_api.repository.RoleRepository;
import com.shop.commerce_api.repository.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;

    private final RoleRepository roles;

    public AdminController(UserRepository users, RoleRepository roles){
        this.users = users;
        this.roles = roles;
    }

    public record PromoteReq(
            @NotBlank @Email
            String email
    ){}

    public record DemoteReq(
            @NotBlank @Email
            String email
    ){}

    public record ApiMsg(
            String message
    ){}

    public record UserRow(
            String id,
            String name,
            String email,
            Set<String> roles
    ){}

    private static  String norm(String email){
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private Role requireRole(ERole name) {
        return roles.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Missing role: " + name));
    }

    private boolean isAdmin(User u) {
        return u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ADMIN);
    }

    // ===== Endpoints =====

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/promote")
    public ResponseEntity<?> promote(@RequestBody PromoteReq req) {
        String email = norm(req.email());
        User u = users.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.badRequest().body(new ApiMsg("User not found: " + email));

        if (isAdmin(u)) return ResponseEntity.ok(new ApiMsg("User is already an admin"));

        var adminRole = requireRole(ERole.ADMIN);
        u.getRoles().add(adminRole);
        users.save(u);

        return ResponseEntity.ok(new ApiMsg("User promoted to admin"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/demote")
    public ResponseEntity<?> demote(@RequestBody DemoteReq req) {
        String email = norm(req.email());
        User u = users.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.badRequest().body(new ApiMsg("User not found: " + email));

        if (!isAdmin(u)) return ResponseEntity.ok(new ApiMsg("User is not an admin"));

        // Safety: don't remove the last remaining admin
        long adminCount = users.findAll().stream().filter(this::isAdmin).count();
        if (adminCount <= 1) {
            return ResponseEntity.badRequest().body(new ApiMsg("Cannot demote the last admin"));
        }

        u.setRoles(u.getRoles().stream()
                .filter(r -> r.getName() != ERole.ADMIN)
                .collect(Collectors.toSet()));
        users.save(u);

        return ResponseEntity.ok(new ApiMsg("User demoted from admin"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        var list = users.findAll().stream()
                .map(u -> new UserRow(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/roles")
    public ResponseEntity<?> listRoles() {
        var list = roles.findAll().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

}
