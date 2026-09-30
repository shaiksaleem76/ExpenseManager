package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Entity.Expense;
import com.example.expensemanager.Entity.RecurringBill;
import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Exception.CategoryNotFoundException;
import com.example.expensemanager.Exception.RecurringBillNotFoundException;
import com.example.expensemanager.Exception.UserNotFoundException;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.dto.RecurringBillRequest;
import com.example.expensemanager.dto.RecurringBillResponse;
import com.example.expensemanager.Repository.CategoryRepository;
import com.example.expensemanager.Repository.RecurringBillRepository;
import com.example.expensemanager.Repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringBillService {
    private static final Logger log =
            LoggerFactory.getLogger(RecurringBillService.class);

    private final RecurringBillRepository recurringBillRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    private final ExpenseRepository expenseRepository;

    public RecurringBillService(
            RecurringBillRepository recurringBillRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,ExpenseRepository expenseRepository) {

        this.recurringBillRepository = recurringBillRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.expenseRepository=expenseRepository;
    }

    public RecurringBillResponse createRecurringBill(
            String email,
            RecurringBillRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        Category category = categoryRepository
                .findByName(request.getCategory())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found: "
                                        + request.getCategory()
                        ));

        RecurringBill bill = new RecurringBill();

        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setFrequency(request.getFrequency());
        bill.setStartDate(request.getStartDate());
        bill.setNextDueDate(request.getNextDueDate());
        bill.setActive(true);

        bill.setUser(user);
        bill.setCategory(category);

        RecurringBill savedBill =
                recurringBillRepository.save(bill);

        RecurringBillResponse response =
                new RecurringBillResponse();

        response.setId(savedBill.getId());
        response.setName(savedBill.getName());
        response.setAmount(savedBill.getAmount());
        response.setFrequency(savedBill.getFrequency());
        response.setStartDate(savedBill.getStartDate());
        response.setNextDueDate(savedBill.getNextDueDate());
        response.setActive(savedBill.isActive());
        response.setCategory(
                savedBill.getCategory().getName()
        );

        return response;
    }

    public List<RecurringBillResponse> getRecurringBills(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        List<RecurringBill> bills =
                recurringBillRepository.findByUser(user);

        return bills.stream()
                .map(bill -> {

                    RecurringBillResponse response =
                            new RecurringBillResponse();

                    response.setId(bill.getId());
                    response.setName(bill.getName());
                    response.setAmount(bill.getAmount());
                    response.setFrequency(bill.getFrequency());
                    response.setStartDate(bill.getStartDate());
                    response.setNextDueDate(bill.getNextDueDate());
                    response.setActive(bill.isActive());
                    response.setCategory(
                            bill.getCategory().getName()
                    );

                    return response;
                })
                .toList();
    }

    public RecurringBillResponse getRecurringBillById(
            Long id,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        RecurringBill bill =
                recurringBillRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RecurringBillNotFoundException(
                                        "Recurring bill not found with id: " + id
                                ));

        RecurringBillResponse response =
                new RecurringBillResponse();

        response.setId(bill.getId());
        response.setName(bill.getName());
        response.setAmount(bill.getAmount());
        response.setFrequency(bill.getFrequency());
        response.setStartDate(bill.getStartDate());
        response.setNextDueDate(bill.getNextDueDate());
        response.setActive(bill.isActive());
        response.setCategory(
                bill.getCategory().getName()
        );

        return response;
    }

    // Update Recurring bill
    public RecurringBillResponse updateRecurringBill(
            Long id,
            String email,
            RecurringBillRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        RecurringBill bill =
                recurringBillRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RecurringBillNotFoundException(
                                        "Recurring bill not found with id: " + id
                                ));

        Category category = categoryRepository
                .findByName(request.getCategory())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found: "
                                        + request.getCategory()
                        ));

        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setFrequency(request.getFrequency());
        bill.setStartDate(request.getStartDate());
        bill.setNextDueDate(request.getNextDueDate());
        bill.setCategory(category);

        RecurringBill updatedBill =
                recurringBillRepository.save(bill);

        RecurringBillResponse response =
                new RecurringBillResponse();

        response.setId(updatedBill.getId());
        response.setName(updatedBill.getName());
        response.setAmount(updatedBill.getAmount());
        response.setFrequency(updatedBill.getFrequency());
        response.setStartDate(updatedBill.getStartDate());
        response.setNextDueDate(updatedBill.getNextDueDate());
        response.setActive(updatedBill.isActive());
        response.setCategory(
                updatedBill.getCategory().getName()
        );

        return response;
    }

    // delete recurring bill by id

    public void deleteRecurringBill(
            Long id,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));

        RecurringBill bill =
                recurringBillRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RecurringBillNotFoundException(
                                        "Recurring bill not found with id: " + id
                                ));

        recurringBillRepository.delete(bill);
    }

// processing due recurring bills
@Transactional
public void processDueRecurringBills() {

    LocalDate today = LocalDate.now();

    List<RecurringBill> dueBills =
            recurringBillRepository
                    .findByActiveTrueAndNextDueDateLessThanEqual(today);

    for (RecurringBill bill : dueBills) {

        while (!bill.getNextDueDate().isAfter(today)) {

            Expense expense = new Expense();

            expense.setTitle(bill.getName());
            expense.setAmount(bill.getAmount());
            expense.setCategory(bill.getCategory());
            expense.setUser(bill.getUser());
            expense.setDate(bill.getNextDueDate());
            expense.setDescription("Recurring bill");

            expenseRepository.save(expense);
            log.info("Next due date updated for bill: {} to {}",
                    bill.getName(),
                    bill.getNextDueDate());


            if (bill.getFrequency().equals("MONTHLY")) {

                bill.setNextDueDate(
                        bill.getNextDueDate().plusMonths(1)
                );

            } else if (bill.getFrequency().equals("YEARLY")) {

                bill.setNextDueDate(
                        bill.getNextDueDate().plusYears(1)
                );

            } else if (bill.getFrequency().equals("EVERY_6_MONTHS")) {

                bill.setNextDueDate(
                        bill.getNextDueDate().plusMonths(6)
                );
            }
        }

        recurringBillRepository.save(bill);
    }
}
    @Scheduled(cron = "0 0 0 * * *")
    public void scheduledRecurringBillProcessing() {

        processDueRecurringBills();

    }
}