package com.example.expensemanager.Repository;

import com.example.expensemanager.Entity.Budget;
import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);

    Optional<Budget> findByIdAndUser(Long id, User user);

    // Find budget for a specific user, category, month and year
    Optional<Budget> findByUserAndCategoryAndMonthAndYear(
            User user,
            Category category,
            int month,
            int year
    );
}