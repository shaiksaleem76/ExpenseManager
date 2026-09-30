package com.example.expensemanager.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardResponse {

    private int month;
    private int year;
    private BigDecimal totalExpenses;
    private long totalTransactions;
    private Map<String, BigDecimal> categoryWiseExpenses;

    private BigDecimal budget;
    private BigDecimal remainingBudget;
    private String budgetStatus;

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public Map<String, BigDecimal> getCategoryWiseExpenses() {
        return categoryWiseExpenses;
    }

    public void setCategoryWiseExpenses(Map<String, BigDecimal> categoryWiseExpenses) {
        this.categoryWiseExpenses = categoryWiseExpenses;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(BigDecimal remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public String getBudgetStatus() {
        return budgetStatus;
    }

    public void setBudgetStatus(String budgetStatus) {
        this.budgetStatus = budgetStatus;
    }
}