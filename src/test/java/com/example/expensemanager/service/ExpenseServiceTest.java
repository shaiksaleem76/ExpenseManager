package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.Expense;
import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Repository.CategoryRepository;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.Repository.UserRepository;
import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseService expenseService;


    @Test
    void saveExpense_shouldSaveExpense() {

        // 1. Create request
        ExpenseRequest request = new ExpenseRequest();

        request.setTitle("Lunch");
        request.setAmount(new BigDecimal("500"));
        request.setCategory("Food");
        request.setDate(LocalDate.of(2026, 9, 17));
        request.setDescription("Lunch expense");


        // 2. Create fake Category
        Category category = new Category();
        category.setId(1L);
        category.setName("Food");

        when(categoryRepository.findByName("Food"))
                .thenReturn(Optional.of(category));


        // 3. Create fake logged-in User
        User user = new User();
        user.setId(5L);
        user.setName("Saleem");
        user.setEmail("saleem@test.com");

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.emptyList()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);


        // 4. Create fake saved Expense
        Expense savedExpense = new Expense();

        savedExpense.setId(1L);
        savedExpense.setTitle("Lunch");
        savedExpense.setAmount(new BigDecimal("500"));
        savedExpense.setCategory(category);
        savedExpense.setUser(user);
        savedExpense.setDate(LocalDate.of(2026, 9, 17));
        savedExpense.setDescription("Lunch expense");


        // 5. Tell Mockito what save() should return
        when(expenseRepository.save(any()))
                .thenReturn(savedExpense);


        // 6. Call the actual service method
        ExpenseResponse response =
                expenseService.saveExpense(request);


        // 7. Check the result
        assertEquals(1L, response.getId());
        assertEquals("Lunch", response.getTitle());
        assertEquals(new BigDecimal("500"), response.getAmount());
        assertEquals("Food", response.getCategory());
        assertEquals(
                LocalDate.of(2026, 9, 17),
                response.getDate()
        );
        assertEquals("Lunch expense", response.getDescription());


        // 8. Verify repository.save() was called
        verify(expenseRepository).save(any(Expense.class));


        // 9. Clear SecurityContext after test
        SecurityContextHolder.clearContext();
    }

}