package com.example.expensemanager.service;

import com.example.expensemanager.Entity.User;
import com.example.expensemanager.Repository.UserRepository;
import com.example.expensemanager.dto.LoginRequest;
import com.example.expensemanager.dto.LoginResponse;
import com.example.expensemanager.dto.UserRequest;
import com.example.expensemanager.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.expensemanager.Exception.UserAlreadyExistsException;
import com.example.expensemanager.service.JwtService;
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,JwtService jwtService)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtService=jwtService;

    }

    public UserResponse registerUser(UserRequest userRequest)
    {

        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already registered");
        }
        User user = new User();

        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        User savedUser= userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setId(savedUser.getId());

        return response ;
    }

    public LoginResponse loginUser(LoginRequest loginRequest)
    {
       User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(
               ()-> new RuntimeException("Invalid Email or password"));

       if(!passwordEncoder.matches(loginRequest.getPassword(),user.getPassword()))
       {
           throw new RuntimeException("Invalid Email or password");
       }
       LoginResponse response = new LoginResponse();
       response.setId(user.getId());
       response.setEmail(user.getEmail());
       response.setName(user.getName());

        String token = jwtService.generateToken(user);
        response.setToken(token);

       return response;
    }

    public UserResponse getUserResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());

        return response;
    }
}
