package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Budget;
import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Repository.BudgetRepository;
import com.example.expensemanager.dto.DashboardResponse;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.Repository.UserRepository;
import com.example.expensemanager.Exception.UserNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    public DashboardService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,BudgetRepository budgetRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.budgetRepository=budgetRepository;
    }

    public DashboardResponse getDashboard(
            String email,
            int month,
            int year) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        BigDecimal totalExpenses =
                expenseRepository.getTotalExpensesByMonth(
                        user,
                        month,
                        year
                );

        long totalTransactions =
                expenseRepository.getTotalTransactionsByMonth(
                        user,
                        month,
                        year
                );

        List<Object[]> categoryData =
                expenseRepository.getCategoryWiseExpenses(
                        user,
                        month,
                        year
                );

        Map<String, BigDecimal> categoryWiseExpenses =
                new HashMap<>();

        for (Object[] row : categoryData) {

            String categoryName = (String) row[0];

            BigDecimal amount = (BigDecimal) row[1];

            categoryWiseExpenses.put(categoryName, amount);
        }
        Budget budget = budgetRepository
                .findByUser(user)
                .stream()
                .filter(b ->
                        b.getMonth() == month &&
                                b.getYear() == year
                )
                .findFirst()
                .orElse(null);

        BigDecimal budgetAmount = BigDecimal.ZERO;
        BigDecimal remainingBudget = BigDecimal.ZERO;
        String budgetStatus = "NO BUDGET";

        if (budget != null) {

            budgetAmount = budget.getAmount();

            remainingBudget =
                    budgetAmount.subtract(totalExpenses);

            if (totalExpenses.compareTo(budgetAmount) > 0) {
                budgetStatus = "OVER BUDGET";
            } else {
                budgetStatus = "WITHIN BUDGET";
            }
        }

        DashboardResponse response = new DashboardResponse();

        response.setMonth(month);
        response.setYear(year);
        response.setTotalExpenses(totalExpenses);
        response.setTotalTransactions(totalTransactions);
        response.setCategoryWiseExpenses(categoryWiseExpenses);

        response.setBudget(budgetAmount);
        response.setRemainingBudget(remainingBudget);
        response.setBudgetStatus(budgetStatus);

        return response;
    }
}