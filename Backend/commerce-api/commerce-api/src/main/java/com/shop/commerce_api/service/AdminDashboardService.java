package com.shop.commerce_api.service;

import com.shop.commerce_api.dto.AlertDto;
import com.shop.commerce_api.dto.RecentOrderDto;
import com.shop.commerce_api.entity.Order;
import com.shop.commerce_api.entity.OrderStatus;
import com.shop.commerce_api.entity.User;
import com.shop.commerce_api.repository.OrderRepository;
import com.shop.commerce_api.repository.ProductRepository;
import com.shop.commerce_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminDashboardService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // ---------- 1) KPIs ----------
    public Map<String, Object> getKpis() {
        Instant now = Instant.now();

        // Today range in UTC
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant startOfDay = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        // 🔹 All non-CANCELLED orders created today
        List<Order> todayNonCancelled = orderRepository
                .findByCreatedAtBetweenAndStatusNot(startOfDay, endOfDay, OrderStatus.CANCELLED);

        double revenueToday = todayNonCancelled.stream()
                .mapToDouble(Order::getTotal)
                .sum();

        long totalOrders = orderRepository.count(); // all orders in DB

        // 🔹 Active users = unique customers with non-CANCELLED orders in last 30 minutes
        Instant last30min = now.minus(Duration.ofMinutes(30));
        List<Order> last30Orders = orderRepository
                .findByCreatedAtBetweenAndStatusNot(last30min, now, OrderStatus.CANCELLED);

        long activeUsers = last30Orders.stream()
                .map(o -> {
                    if (o.getUserId() != null) {
                        return o.getUserId();         // registered user
                    }
                    return o.getEmail();              // fallback: guest by email
                })
                .filter(Objects::nonNull)
                .distinct()
                .count();

        // Low-stock items
        int lowStockThreshold = 5;
        long lowStockCount = productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() < lowStockThreshold)
                .count();

        Map<String, Object> res = new HashMap<>();
        res.put("revenueToday", revenueToday);
        res.put("totalOrders", totalOrders);
        res.put("activeUsers", activeUsers);
        res.put("lowStockCount", lowStockCount);

        return res;
    }

    // ---------- 2) Sales last 7 days ----------
    public Map<String, Object> getWeeklySales() {
        ZoneId zone = ZoneOffset.UTC;
        LocalDate today = LocalDate.now(zone);

        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            Instant start = day.atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant end = day.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

            // 🔹 All non-CANCELLED orders that day
            List<Order> ordersDay = orderRepository
                    .findByCreatedAtBetweenAndStatusNot(start, end, OrderStatus.CANCELLED);

            double sum = ordersDay.stream()
                    .mapToDouble(Order::getTotal)
                    .sum();

            labels.add(day.getDayOfWeek().name().substring(0, 3)); // MON, TUE...
            values.add(sum);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("labels", labels);
        res.put("values", values);
        return res;
    }

    // ---------- 3) Recent orders ----------
    public List<RecentOrderDto> getRecentOrders() {
        List<Order> orders = orderRepository.findTop10ByOrderByCreatedAtDesc();

        // load users once into a map
        Map<String, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return orders.stream()
                .map(o -> {
                    User u = userMap.get(o.getUserId());

                    // Prefer registered username/email; fall back to order data if needed
                    String name = (u != null && u.getName() != null)
                            ? u.getName()
                            : (o.getFullName() != null ? o.getFullName() : "Unknown");

                    String email = (u != null && u.getEmail() != null)
                            ? u.getEmail()
                            : (o.getEmail() != null ? o.getEmail() : "");

                    return new RecentOrderDto(
                            o.getId(),
                            name,
                            email,
                            o.getTotal(),     // double → auto-boxed to Double
                            o.getStatus(),
                            o.getCreatedAt()
                    );
                })
                .toList();
    }

    // ---------- 4) Alerts ----------
    public List<AlertDto> getAlerts() {
        List<AlertDto> alerts = new ArrayList<>();

        // Low stock alerts
        int lowStockThreshold = 5;
        productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() < lowStockThreshold)
                .forEach(p -> alerts.add(
                        new AlertDto("WARNING", "Stock low for \"" + p.getTitle() + "\"")
                ));

        return alerts;
    }
}
