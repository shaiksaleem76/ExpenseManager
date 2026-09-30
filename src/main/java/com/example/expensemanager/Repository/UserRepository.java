package com.example.expensemanager.Repository;

import com.example.expensemanager.Entity.Expense;
import com.example.expensemanager.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
}
