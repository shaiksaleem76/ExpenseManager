package com.example.expensemanager.Repository;

import com.example.expensemanager.Entity.RecurringBill;
import com.example.expensemanager.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecurringBillRepository
        extends JpaRepository<RecurringBill, Long> {

    List<RecurringBill> findByUser(User user);

    Optional<RecurringBill> findByIdAndUser(Long id, User user);

    List<RecurringBill> findByActiveTrueAndNextDueDateLessThanEqual(
            LocalDate date
    );
}