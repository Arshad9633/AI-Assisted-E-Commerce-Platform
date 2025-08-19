package com.shop.commerce_api.controller;


import com.shop.commerce_api.dto.JwtResponse;
import com.shop.commerce_api.dto.LoginRequest;
import com.shop.commerce_api.dto.SignupRequest;
import com.shop.commerce_api.entity.ERole;
import com.shop.commerce_api.entity.Role;
import com.shop.commerce_api.entity.User;
import com.shop.commerce_api.repository.RoleRepository;
import com.shop.commerce_api.repository.UserRepository;
import com.shop.commerce_api.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    BCryptPasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody @jakarta.validation.Valid SignupRequest request){
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)){
            return ResponseEntity.status(409).body("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(encoder.encode(request.getPassword()));

        Role customerRole = roleRepository.findByName(ERole.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("Role not found: CUSTOMER"));
        user.setRoles(Set.of(customerRole));

        userRepository.save(user);
        return ResponseEntity.status(201).body("User registered successfully");
    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody @jakarta.validation.Valid LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = jwtUtils.generateJwt(user.getEmail());
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(java.util.stream.Collectors.toSet());

        return ResponseEntity.ok(new JwtResponse(token, user.getEmail(), roles));
    }


}
