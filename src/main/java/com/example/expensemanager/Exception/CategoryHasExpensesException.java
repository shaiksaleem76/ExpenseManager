package com.example.expensemanager.Exception;

public class CategoryHasExpensesException extends RuntimeException{

    public CategoryHasExpensesException(String message)
    {
        super(message);
    }
}
