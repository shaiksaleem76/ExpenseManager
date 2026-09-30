package com.example.expensemanager.Exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExpenseNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleExpenseNotFound(
            ExpenseNotFoundException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(InvalidExpenseException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleInvalidAmount(
            InvalidExpenseException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleMethodArgument(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return errors;
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<String> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleCategoryNotFound(
            CategoryNotFoundException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(CategoryHasExpensesException.class)
    public ResponseEntity<String> handleCategoryHasExpenses(
            CategoryHasExpensesException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(exception.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleUserNotFound(
            UserNotFoundException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(BudgetNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBudgetNotFound(
            BudgetNotFoundException exception) {

        return exception.getMessage();
    }

    @ExceptionHandler(RecurringBillNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleRecurringBillNotFound(
            RecurringBillNotFoundException exception) {

        return exception.getMessage();
    }

    // =========================================================
    // GENERIC RUNTIME EXCEPTION
    // Used for budget validation errors from ExpenseService
    // =========================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(
            RuntimeException exception) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(exception.getMessage());
    }
}