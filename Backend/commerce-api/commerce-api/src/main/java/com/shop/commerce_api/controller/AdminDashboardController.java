package com.shop.commerce_api.controller;

import com.shop.commerce_api.dto.AlertDto;
import com.shop.commerce_api.dto.RecentOrderDto;
import com.shop.commerce_api.service.AdminDashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/kpis")
    public Map<String, Object> getKpis() {
        return adminDashboardService.getKpis();
    }

    @GetMapping("/sales-week")
    public Map<String, Object> getWeeklySales() {
        return adminDashboardService.getWeeklySales();
    }

    @GetMapping("/recent-orders")
    public List<RecentOrderDto> getRecentOrders() {
        return adminDashboardService.getRecentOrders();
    }

    @GetMapping("/alerts")
    public List<AlertDto> getAlerts() {
        return adminDashboardService.getAlerts();
    }
}
