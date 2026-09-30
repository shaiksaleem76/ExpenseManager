package com.example.expensemanager.Exception;

public class RecurringBillNotFoundException
        extends RuntimeException {

    public RecurringBillNotFoundException(String message) {
        super(message);
    }
}