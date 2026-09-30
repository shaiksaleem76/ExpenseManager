package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Budget;
import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.Expense;
import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Exception.ExpenseNotFoundException;
import com.example.expensemanager.Exception.UserNotFoundException;
import com.example.expensemanager.Repository.BudgetRepository;
import com.example.expensemanager.Repository.CategoryRepository;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.Repository.UserRepository;
import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    private static final Logger log =
            LoggerFactory.getLogger(ExpenseService.class);

    public ExpenseService(
            ExpenseRepository expenseRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            BudgetRepository budgetRepository) {

        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.budgetRepository = budgetRepository;
    }

    // =========================================================
    // SAVE EXPENSE
    // =========================================================

    @Transactional
    public ExpenseResponse saveExpense(ExpenseRequest expenseRequest) {

        // Find category
        Category category = categoryRepository
                .findByName(expenseRequest.getCategory())
                .orElseThrow(() ->
                        new RuntimeException("Category not found")
                );

        // Get currently logged-in user
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // =====================================================
        // BUDGET VALIDATION
        // =====================================================

        int month = expenseRequest.getDate().getMonthValue();
        int year = expenseRequest.getDate().getYear();

        // Find budget for this user + category + month + year
        Budget budget = budgetRepository
                .findByUserAndCategoryAndMonthAndYear(
                        user,
                        category,
                        month,
                        year
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "No budget configured for "
                                        + category.getName()
                                        + " for "
                                        + month
                                        + "/"
                                        + year
                        )
                );

        // Calculate how much is already spent
        BigDecimal spent =
                expenseRepository.getTotalExpenseForBudget(
                        user,
                        category,
                        month,
                        year
                );

        // Calculate remaining budget
        BigDecimal remaining =
                budget.getAmount().subtract(spent);

        // Check whether new expense exceeds remaining budget
        if (expenseRequest.getAmount().compareTo(remaining) > 0) {

            throw new RuntimeException(
                    "Budget exceeded for "
                            + category.getName()
                            + ". Remaining budget: ₹"
                            + remaining
            );
        }

        // =====================================================
        // CREATE EXPENSE
        // =====================================================

        Expense expense = new Expense();

        expense.setTitle(expenseRequest.getTitle());
        expense.setAmount(expenseRequest.getAmount());
        expense.setCategory(category);
        expense.setUser(user);
        expense.setDate(expenseRequest.getDate());
        expense.setDescription(expenseRequest.getDescription());

        Expense savedExpense = expenseRepository.save(expense);

        log.info(
                "Expense created successfully with id: {}",
                savedExpense.getId()
        );

        // =====================================================
        // CREATE RESPONSE
        // =====================================================

        ExpenseResponse response = new ExpenseResponse();

        response.setId(savedExpense.getId());
        response.setTitle(savedExpense.getTitle());
        response.setAmount(savedExpense.getAmount());
        response.setCategory(savedExpense.getCategory().getName());
        response.setDate(savedExpense.getDate());
        response.setDescription(savedExpense.getDescription());

        return response;
    }


    // =========================================================
    // GET EXPENSE BY ID
    // =========================================================

    public ExpenseResponse getExpenseById(Long id) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(
                                "Expense not found with id: " + id
                        )
                );

        // Check whether expense belongs to logged-in user
        if (!expense.getUser().getId().equals(user.getId())) {

            throw new ExpenseNotFoundException(
                    "Expense not found with id: " + id
            );
        }

        ExpenseResponse response = new ExpenseResponse();

        response.setId(expense.getId());
        response.setTitle(expense.getTitle());
        response.setAmount(expense.getAmount());
        response.setCategory(expense.getCategory().getName());
        response.setDate(expense.getDate());
        response.setDescription(expense.getDescription());

        return response;
    }


    // =========================================================
    // GET ALL EXPENSES
    // =========================================================

    public List<ExpenseResponse> getAllExpenses() {

        // Get currently logged-in user
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // Get only this user's expenses
        List<Expense> expenses =
                expenseRepository.findByUser(user);

        return expenses.stream()
                .map(expense -> {

                    ExpenseResponse response =
                            new ExpenseResponse();

                    response.setId(expense.getId());
                    response.setTitle(expense.getTitle());
                    response.setAmount(expense.getAmount());
                    response.setCategory(
                            expense.getCategory().getName()
                    );
                    response.setDate(expense.getDate());
                    response.setDescription(
                            expense.getDescription()
                    );

                    return response;
                })
                .toList();
    }


    // =========================================================
    // UPDATE EXPENSE
    // =========================================================

    public ExpenseResponse updateExpense(
            Long id,
            ExpenseRequest expenseRequest) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Expense existingExpense =
                expenseRepository.findById(id)
                        .orElseThrow(() ->
                                new ExpenseNotFoundException(
                                        "Expense not found with id: "
                                                + id
                                )
                        );

        // Check whether this expense belongs to logged-in user
        if (!existingExpense.getUser().getId().equals(user.getId())) {

            throw new ExpenseNotFoundException(
                    "Expense not found with id: " + id
            );
        }

        Category category = categoryRepository
                .findByName(expenseRequest.getCategory())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found"
                        )
                );

        existingExpense.setTitle(expenseRequest.getTitle());
        existingExpense.setAmount(expenseRequest.getAmount());
        existingExpense.setCategory(category);
        existingExpense.setDate(expenseRequest.getDate());
        existingExpense.setDescription(
                expenseRequest.getDescription()
        );

        Expense updatedExpense =
                expenseRepository.save(existingExpense);

        log.info(
                "Expense updated successfully with id: {}",
                updatedExpense.getId()
        );

        ExpenseResponse response = new ExpenseResponse();

        response.setId(updatedExpense.getId());
        response.setTitle(updatedExpense.getTitle());
        response.setAmount(updatedExpense.getAmount());
        response.setCategory(
                updatedExpense.getCategory().getName()
        );
        response.setDate(updatedExpense.getDate());
        response.setDescription(
                updatedExpense.getDescription()
        );

        return response;
    }


    // =========================================================
    // DELETE EXPENSE
    // =========================================================

    public void deleteExpense(Long id) {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Expense existingExpense =
                expenseRepository.findById(id)
                        .orElseThrow(() ->
                                new ExpenseNotFoundException(
                                        "Expense not found with id: "
                                                + id
                                )
                        );

        // Expense must belong to logged-in user
        if (existingExpense.getUser() == null ||
                !existingExpense.getUser()
                        .getId()
                        .equals(user.getId())) {

            throw new ExpenseNotFoundException(
                    "Expense not found with id: " + id
            );
        }

        expenseRepository.delete(existingExpense);

        log.info(
                "Expense deleted successfully with id: {}",
                existingExpense.getId()
        );
    }


    // =========================================================
    // GET EXPENSES BY MONTH
    // =========================================================

    public List<ExpenseResponse> getExpensesByMonth(
            String email,
            int month,
            int year) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );

        List<Expense> expenses =
                expenseRepository.findByUserAndMonthAndYear(
                        user,
                        month,
                        year
                );

        return expenses.stream()
                .map(expense -> {

                    ExpenseResponse response =
                            new ExpenseResponse();

                    response.setId(expense.getId());
                    response.setTitle(expense.getTitle());
                    response.setAmount(expense.getAmount());
                    response.setCategory(
                            expense.getCategory().getName()
                    );
                    response.setDate(expense.getDate());
                    response.setDescription(
                            expense.getDescription()
                    );

                    return response;
                })
                .toList();
    }


    // =========================================================
    // GET EXPENSES BY MONTH AND CATEGORY
    // =========================================================

    public List<ExpenseResponse> getExpensesByMonthAndCategory(
            String email,
            int month,
            int year,
            String category) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );

        List<Expense> expenses =
                expenseRepository
                        .findByUserAndMonthAndYearAndCategory(
                                user,
                                month,
                                year,
                                category
                        );

        return expenses.stream()
                .map(expense -> {

                    ExpenseResponse response =
                            new ExpenseResponse();

                    response.setId(expense.getId());
                    response.setTitle(expense.getTitle());
                    response.setAmount(expense.getAmount());
                    response.setCategory(
                            expense.getCategory().getName()
                    );
                    response.setDate(expense.getDate());
                    response.setDescription(
                            expense.getDescription()
                    );

                    return response;
                })
                .toList();
    }


    // =========================================================
    // PAGINATION + SORTING + SEARCH
    // =========================================================

    public Page<ExpenseResponse> getExpenses(
            String email,
            int month,
            int year,
            int page,
            int size,
            String sortBy,
            String direction,
            String search) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );

        // Create sorting based on user's request
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        // Create pagination + sorting
        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );

        // Get user's expenses for requested month/year
        Page<Expense> expenses;

        if (search == null ||
                search.trim().isEmpty()) {

            expenses =
                    expenseRepository
                            .findPageByUserAndMonthAndYear(
                                    user,
                                    month,
                                    year,
                                    pageable
                            );

        } else {

            expenses =
                    expenseRepository.searchExpenses(
                            user,
                            month,
                            year,
                            search,
                            pageable
                    );
        }

        // Convert Expense -> ExpenseResponse
        return expenses.map(expense -> {

            ExpenseResponse response =
                    new ExpenseResponse();

            response.setId(expense.getId());
            response.setTitle(expense.getTitle());
            response.setAmount(expense.getAmount());
            response.setCategory(
                    expense.getCategory().getName()
            );
            response.setDate(expense.getDate());
            response.setDescription(
                    expense.getDescription()
            );

            return response;
        });
    }
}