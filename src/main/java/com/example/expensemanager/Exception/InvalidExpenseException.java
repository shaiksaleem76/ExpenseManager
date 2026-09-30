package com.example.expensemanager.Exception;

public class InvalidExpenseException extends RuntimeException{
    public InvalidExpenseException(String message)
    {
        super(message);
    }
}