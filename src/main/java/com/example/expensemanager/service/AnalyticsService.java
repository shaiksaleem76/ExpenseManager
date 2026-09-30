package com.example.expensemanager.service;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Exception.UserNotFoundException;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public AnalyticsService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }
// expenses of last 6 months
    public Map<String, BigDecimal> getMonthlySpendingTrend(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        LocalDate currentMonth =
                LocalDate.now().withDayOfMonth(1);

        LocalDate startDate =
                currentMonth.minusMonths(5);

        LocalDate endDate =
                currentMonth.withDayOfMonth(
                        currentMonth.lengthOfMonth()
                );

        List<Object[]> data =
                expenseRepository.getMonthlyExpenseTrend(
                        user,
                        startDate,
                        endDate
                );

        Map<String, BigDecimal> monthlyTrend =
                new LinkedHashMap<>();

        LocalDate month = startDate;

        while (!month.isAfter(currentMonth)) {

            String key = String.format(
                    "%d-%02d",
                    month.getYear(),
                    month.getMonthValue()
            );

            monthlyTrend.put(key, BigDecimal.ZERO);

            month = month.plusMonths(1);
        }

        for (Object[] row : data) {

            int year = ((Number) row[0]).intValue();
            int monthValue = ((Number) row[1]).intValue();

            BigDecimal amount =
                    (BigDecimal) row[2];

            String key = String.format(
                    "%d-%02d",
                    year,
                    monthValue
            );

            monthlyTrend.put(key, amount);
        }

        return monthlyTrend;
    }
// category wise spending for last 6 months
    public Map<String, BigDecimal> getCategoryWiseSpending(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        LocalDate currentMonth =
                LocalDate.now().withDayOfMonth(1);

        LocalDate startDate =
                currentMonth.minusMonths(5);

        LocalDate endDate =
                currentMonth.withDayOfMonth(
                        currentMonth.lengthOfMonth()
                );

        List<Object[]> data =
                expenseRepository.getCategoryWiseExpensesForPeriod(
                        user,
                        startDate,
                        endDate
                );

        Map<String, BigDecimal> categoryWiseSpending =
                new LinkedHashMap<>();

        for (Object[] row : data) {

            String categoryName =
                    (String) row[0];

            BigDecimal amount =
                    (BigDecimal) row[1];

            categoryWiseSpending.put(
                    categoryName,
                    amount
            );
        }

        return categoryWiseSpending;
    }

    // last month and current month comparion

    public Map<String, BigDecimal> getMonthToMonthComparison(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        // Current month
        LocalDate currentMonth =
                LocalDate.now().withDayOfMonth(1);

        // Previous month
        LocalDate previousMonth =
                currentMonth.minusMonths(1);

        // Current month dates
        LocalDate currentStart =
                currentMonth;

        LocalDate currentEnd =
                currentMonth.withDayOfMonth(
                        currentMonth.lengthOfMonth()
                );

        // Previous month dates
        LocalDate previousStart =
                previousMonth;

        LocalDate previousEnd =
                previousMonth.withDayOfMonth(
                        previousMonth.lengthOfMonth()
                );

        // Get current month spending
        BigDecimal currentAmount =
                expenseRepository.getTotalExpensesForPeriod(
                        user,
                        currentStart,
                        currentEnd
                );

        // Get previous month spending
        BigDecimal previousAmount =
                expenseRepository.getTotalExpensesForPeriod(
                        user,
                        previousStart,
                        previousEnd
                );

        // Difference
        BigDecimal difference =
                currentAmount.subtract(previousAmount);

        // Percentage change
        BigDecimal percentageChange =
                BigDecimal.ZERO;

        if (previousAmount.compareTo(BigDecimal.ZERO) != 0) {

            percentageChange =
                    difference
                            .divide(
                                    previousAmount,
                                    2,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(BigDecimal.valueOf(100));
        }

        Map<String, BigDecimal> comparison =
                new LinkedHashMap<>();

        comparison.put("currentMonth", currentAmount);
        comparison.put("previousMonth", previousAmount);
        comparison.put("difference", difference);
        comparison.put("percentageChange", percentageChange);

        return comparison;
    }

    // Average mothly spending per month
    public BigDecimal getAverageMonthlySpending(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        LocalDate currentMonth =
                LocalDate.now().withDayOfMonth(1);

        LocalDate startDate =
                currentMonth.minusMonths(5);

        LocalDate endDate =
                currentMonth.withDayOfMonth(
                        currentMonth.lengthOfMonth()
                );

        BigDecimal total =
                expenseRepository.getTotalExpensesForPeriod(
                        user,
                        startDate,
                        endDate
                );

        return total.divide(
                BigDecimal.valueOf(6),
                2,
                RoundingMode.HALF_UP
        );
    }


}