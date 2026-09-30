package com.example.expensemanager.Exception;

public class BudgetNotFoundException extends RuntimeException{
    public BudgetNotFoundException(String message) {
        super(message);
    }
}
