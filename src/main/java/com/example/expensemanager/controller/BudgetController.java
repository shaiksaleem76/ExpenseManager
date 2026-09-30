package com.example.expensemanager.controller;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetResponse;
import com.example.expensemanager.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @RequestBody BudgetRequest budgetRequest,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        String email = user.getEmail();

        BudgetResponse response =
                budgetService.createBudget(budgetRequest, email);

        return ResponseEntity.ok(response);
    }
// get budget
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getMyBudgets(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        List<BudgetResponse> budgets =
                budgetService.getMyBudgets(email);

        return ResponseEntity.ok(budgets);
    }

    // get budget by id
    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        BudgetResponse response =
                budgetService.getBudgetById(id, email);

        return ResponseEntity.ok(response);
    }

    //update budget

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetRequest budgetRequest,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        BudgetResponse response =
                budgetService.updateBudget(
                        id,
                        budgetRequest,
                        email
                );

        return ResponseEntity.ok(response);
    }

    // delete budget

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        budgetService.deleteBudget(id, email);

        return ResponseEntity.ok(
                "Budget deleted successfully"
        );
    }

    // get budget summary api
    @GetMapping("/{id}/summary")
    public ResponseEntity<BudgetResponse> getBudgetSummary(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        BudgetResponse response =
                budgetService.getBudgetSummary(id, email);

        return ResponseEntity.ok(response);
    }
}