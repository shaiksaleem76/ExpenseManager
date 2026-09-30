package com.example.expensemanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ExpensemanagerApplication {

	public static void main(String[] args) {

		SpringApplication.run(ExpensemanagerApplication.class, args);
	}

}
