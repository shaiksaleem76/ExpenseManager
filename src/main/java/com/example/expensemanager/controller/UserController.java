package com.example.expensemanager.controller;


import com.example.expensemanager.Entity.User;
import com.example.expensemanager.dto.LoginRequest;
import com.example.expensemanager.dto.LoginResponse;
import com.example.expensemanager.dto.UserRequest;
import com.example.expensemanager.dto.UserResponse;
import com.example.expensemanager.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService)
    {
        this.userService=userService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(@RequestBody UserRequest userRequest)
    {
        return userService.registerUser(userRequest);
    }
    @PostMapping("/login")
    public LoginResponse loginUser(@RequestBody LoginRequest loginRequest)
    {
        return userService.loginUser(loginRequest);
    }
    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return userService.getUserResponse(user);
    }
}

