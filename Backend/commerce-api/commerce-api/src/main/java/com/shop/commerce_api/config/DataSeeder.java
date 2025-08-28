package com.shop.commerce_api.config;

import com.shop.commerce_api.entity.*;
import com.shop.commerce_api.repository.RoleRepository;
import com.shop.commerce_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create roles if they don't exist
        Role adminRole = roleRepository.findByName(ERole.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(null,ERole.ADMIN)));

        Role customerRole = roleRepository.findByName(ERole.CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(null, ERole.CUSTOMER)));

        // Create default admin if not exists
        if (userRepository.findByEmail("admin@shop.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@shop.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin@shop.com / Admin@123");
        }
    }
}
