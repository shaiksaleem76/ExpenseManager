package com.example.expensemanager.controller;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseResponse;
import com.example.expensemanager.service.ExpenseService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@SecurityRequirement(name = "Bearer Authentication")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ExpenseResponse createExpense(
            @Valid @RequestBody ExpenseRequest expenseRequest) {

        return expenseService.saveExpense(expenseRequest);
    }

    @GetMapping("/{id}")
    public ExpenseResponse getExpense(
            @PathVariable Long id) {

        return expenseService.getExpenseById(id);
    }
// get expenses by monthly
    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getExpensesByMonth(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        Page<ExpenseResponse> expenses =
                expenseService.getExpenses(
                        email,
                        month,
                        year,
                        page,
                        size,
                        sortBy,
                        direction,
                        search
                );

        return ResponseEntity.ok(expenses);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest expenseRequest) {

        return expenseService.updateExpense(id, expenseRequest);
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id) {

        expenseService.deleteExpense(id);

        return "Expense deleted successfully";
    }
//get all expenses by month and category
    @GetMapping("/filter")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByMonthAndCategory(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam String category,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        List<ExpenseResponse> expenses =
                expenseService.getExpensesByMonthAndCategory(
                        email,
                        month,
                        year,
                        category
                );

        return ResponseEntity.ok(expenses);
    }
}