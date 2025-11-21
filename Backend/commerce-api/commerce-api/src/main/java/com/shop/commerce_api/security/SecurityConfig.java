package com.shop.commerce_api.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .formLogin(f -> f.disable())
                .httpBasic(b -> b.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Allow CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // Public GET endpoints
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalog/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalog/categories/**").permitAll()

                        .requestMatchers("/error", "/error/**").permitAll()

                        // User orders
                        .requestMatchers("/api/orders/**").authenticated()

                        // Cart
                        .requestMatchers("/api/cart/**").authenticated()


                        //Notification
                        .requestMatchers("/api/notifications/**").authenticated()
                        // Sample routes
                        .requestMatchers("/home").permitAll()
                        .requestMatchers("/home/user").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/home/admin").hasRole("ADMIN")

                        // Admin-only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Everything else
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ FIXED CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(Arrays.asList("*")); // or http://localhost:3000
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
