package com.example.expensemanager.Repository;

import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.Expense;
import com.example.expensemanager.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense,Long> {
    Page<Expense> findByUser(User user, Pageable pageable);
    List<Expense> findByUser(User user);
    boolean existsByCategory(Category category);

    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND e.category = :category
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        """)
    BigDecimal getTotalExpenseForBudget(
            User user,
            Category category,
            int month,
            int year
    );


    @Query("""
        SELECT e
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        """)
    List<Expense> findByUserAndMonthAndYear(
            User user,
            int month,
            int year
    );

    @Query("""
        SELECT e
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        AND e.category.name = :category
        """)
    List<Expense> findByUserAndMonthAndYearAndCategory(
            User user,
            int month,
            int year,
            String category
    );
// total spending for whole month
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        """)
    BigDecimal getTotalExpensesByMonth(
            User user,
            int month,
            int year
    );
// total transactions per month
    @Query("""
        SELECT COUNT(e)
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        """)
    long getTotalTransactionsByMonth(
            User user,
            int month,
            int year
    );
// category wise expense for 1 month
    @Query("""
        SELECT e.category.name, COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        GROUP BY e.category.name
        """)
    List<Object[]> getCategoryWiseExpenses(
            User user,
            int month,
            int year
    );
// last 6 months analytics
    @Query("""
        SELECT YEAR(e.date), MONTH(e.date), COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND e.date >= :startDate
        AND e.date <= :endDate
        GROUP BY YEAR(e.date), MONTH(e.date)
        ORDER BY YEAR(e.date), MONTH(e.date)
        """)
    List<Object[]> getMonthlyExpenseTrend(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );
// last 6 months comparison category wise
    @Query("""
        SELECT e.category.name, COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND e.date >= :startDate
        AND e.date <= :endDate
        GROUP BY e.category.name
        ORDER BY SUM(e.amount) DESC
        """)
    List<Object[]> getCategoryWiseExpensesForPeriod(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

// Month-to-Month Comparison
    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.user = :user
        AND e.date >= :startDate
        AND e.date <= :endDate
        """)
    BigDecimal getTotalExpensesForPeriod(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );
// sorting filter query
    @Query("""
        SELECT e
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        """)
    Page<Expense> findPageByUserAndMonthAndYear(
            User user,
            int month,
            int year,
            Pageable pageable
    );

    // searching filter query
    @Query("""
        SELECT e
        FROM Expense e
        WHERE e.user = :user
        AND MONTH(e.date) = :month
        AND YEAR(e.date) = :year
        AND (
            LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        """)
    Page<Expense> searchExpenses(
            User user,
            int month,
            int year,
            String search,
            Pageable pageable
    );
}
