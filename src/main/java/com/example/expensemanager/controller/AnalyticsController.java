package com.example.expensemanager.controller;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, BigDecimal>>
    getMonthlySpendingTrend(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        String email = user.getEmail();

        Map<String, BigDecimal> trend =
                analyticsService
                        .getMonthlySpendingTrend(email);

        return ResponseEntity.ok(trend);
    }

    @GetMapping("/category")
    public ResponseEntity<Map<String, BigDecimal>>
    getCategoryWiseSpending(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        String email = user.getEmail();

        Map<String, BigDecimal> categoryWiseSpending =
                analyticsService.getCategoryWiseSpending(email);

        return ResponseEntity.ok(categoryWiseSpending);
    }

// Month to month comparison api
    @GetMapping("/comparison")
    public ResponseEntity<Map<String, BigDecimal>>
    getMonthToMonthComparison(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        String email = user.getEmail();

        Map<String, BigDecimal> comparison =
                analyticsService.getMonthToMonthComparison(email);

        return ResponseEntity.ok(comparison);
    }

    // Average monthly spending per month api

    @GetMapping("/average")
    public ResponseEntity<BigDecimal> getAverageMonthlySpending(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        String email = user.getEmail();

        BigDecimal average =
                analyticsService.getAverageMonthlySpending(email);

        return ResponseEntity.ok(average);
    }

}