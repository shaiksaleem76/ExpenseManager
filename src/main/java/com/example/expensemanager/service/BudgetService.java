package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Budget;
import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Exception.BudgetNotFoundException;
import com.example.expensemanager.Exception.CategoryNotFoundException;
import com.example.expensemanager.Exception.UserNotFoundException;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetResponse;
import com.example.expensemanager.Repository.BudgetRepository;
import com.example.expensemanager.Repository.CategoryRepository;
import com.example.expensemanager.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository, ExpenseRepository expenseRepository) {

        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.expenseRepository=expenseRepository;
    }

    public BudgetResponse createBudget(
            BudgetRequest budgetRequest,
            String email) {

        // 1. Find the logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // 2. Find the category
        Category category = categoryRepository
                .findByName(budgetRequest.getCategory())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        // 3. Create Budget object
        Budget budget = new Budget();

        budget.setAmount(budgetRequest.getAmount());
        budget.setMonth(budgetRequest.getMonth());
        budget.setYear(budgetRequest.getYear());
        budget.setUser(user);
        budget.setCategory(category);

        // 4. Save into database
        Budget savedBudget = budgetRepository.save(budget);

        // 5. Convert Entity → Response DTO
        BudgetResponse response = new BudgetResponse();

        response.setId(savedBudget.getId());
        response.setAmount(savedBudget.getAmount());
        response.setMonth(savedBudget.getMonth());
        response.setYear(savedBudget.getYear());
        response.setCategory(savedBudget.getCategory().getName());

        return response;
    }
//get my budget
    public List<BudgetResponse> getMyBudgets(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException ("User not found with email: " + email));

        List<Budget> budgets =
                budgetRepository.findByUser(user);

        return budgets.stream()
                .map(budget -> {

                    BudgetResponse response = new BudgetResponse();

                    response.setId(budget.getId());
                    response.setAmount(budget.getAmount());
                    response.setMonth(budget.getMonth());
                    response.setYear(budget.getYear());
                    response.setCategory(
                            budget.getCategory().getName()
                    );

                    return response;
                })
                .toList();
    }

    //get budget by id

    public BudgetResponse getBudgetById(
            Long id,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        Budget budget = budgetRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new BudgetNotFoundException(
                                "Budget not found with id "+ id
                        ));

        BudgetResponse response = new BudgetResponse();

        response.setId(budget.getId());
        response.setAmount(budget.getAmount());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setCategory(
                budget.getCategory().getName()
        );

        return response;
    }

    // update budget

    public BudgetResponse updateBudget(
            Long id,
            BudgetRequest budgetRequest,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        Budget budget = budgetRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new BudgetNotFoundException(
                                "Budget not found with id :" + id
                        ));

        Category category = categoryRepository
                .findByName(budgetRequest.getCategory())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found"
                        ));

        budget.setAmount(budgetRequest.getAmount());
        budget.setMonth(budgetRequest.getMonth());
        budget.setYear(budgetRequest.getYear());
        budget.setCategory(category);

        Budget updatedBudget =
                budgetRepository.save(budget);

        BudgetResponse response = new BudgetResponse();

        response.setId(updatedBudget.getId());
        response.setAmount(updatedBudget.getAmount());
        response.setMonth(updatedBudget.getMonth());
        response.setYear(updatedBudget.getYear());
        response.setCategory(
                updatedBudget.getCategory().getName()
        );

        return response;
    }

    // delete budget
    public void deleteBudget(
            Long id,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        Budget budget = budgetRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new BudgetNotFoundException(
                                "Budget not found with id " + id
                        ));

        budgetRepository.delete(budget);
    }

    public BudgetResponse getBudgetSummary(
            Long id,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        Budget budget = budgetRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new BudgetNotFoundException(
                                "Budget not found with id: " + id
                        ));

        BigDecimal spent =
                expenseRepository.getTotalExpenseForBudget(
                        user,
                        budget.getCategory(),
                        budget.getMonth(),
                        budget.getYear()
                );

        BigDecimal remaining =
                budget.getAmount().subtract(spent);

        String status;

        if (spent.compareTo(budget.getAmount()) > 0) {
            status = "OVER BUDGET";
        } else {
            status = "WITHIN BUDGET";
        }

        BudgetResponse response = new BudgetResponse();

        response.setId(budget.getId());
        response.setAmount(budget.getAmount());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setCategory(budget.getCategory().getName());

        response.setSpent(spent);
        response.setRemaining(remaining);
        response.setStatus(status);

        return response;
    }
}