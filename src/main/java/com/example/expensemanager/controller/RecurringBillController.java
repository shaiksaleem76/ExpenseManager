package com.example.expensemanager.controller;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.dto.RecurringBillRequest;
import com.example.expensemanager.dto.RecurringBillResponse;
import com.example.expensemanager.service.RecurringBillService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-bills")
public class RecurringBillController {

    private final RecurringBillService recurringBillService;

    public RecurringBillController(
            RecurringBillService recurringBillService) {
        this.recurringBillService = recurringBillService;
    }
//save Bill api
    @PostMapping
    public ResponseEntity<RecurringBillResponse> createRecurringBill(
            @RequestBody RecurringBillRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        RecurringBillResponse response =
                recurringBillService.createRecurringBill(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
// get Recurring Bills api
    @GetMapping
    public ResponseEntity<List<RecurringBillResponse>> getRecurringBills(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        List<RecurringBillResponse> bills =
                recurringBillService.getRecurringBills(email);

        return ResponseEntity.ok(bills);
    }
// get Recurring Bill by id api
    @GetMapping("/{id}")
    public ResponseEntity<RecurringBillResponse> getRecurringBillById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        RecurringBillResponse response =
                recurringBillService.getRecurringBillById(
                        id,
                        email
                );

        return ResponseEntity.ok(response);
    }
//Update recurring bill api
    @PutMapping("/{id}")
    public ResponseEntity<RecurringBillResponse> updateRecurringBill(
            @PathVariable Long id,
            @RequestBody RecurringBillRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        RecurringBillResponse response =
                recurringBillService.updateRecurringBill(
                        id,
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
// Delete bill by id api
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRecurringBill(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        recurringBillService.deleteRecurringBill(
                id,
                email
        );

        return ResponseEntity.ok(
                "Recurring bill deleted successfully"
        );
    }




}