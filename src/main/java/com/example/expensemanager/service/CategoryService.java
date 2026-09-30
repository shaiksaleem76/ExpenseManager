package com.example.expensemanager.service;

import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.Exception.CategoryHasExpensesException;
import com.example.expensemanager.Exception.CategoryNotFoundException;
import com.example.expensemanager.Repository.CategoryRepository;
import com.example.expensemanager.Repository.ExpenseRepository;
import com.example.expensemanager.dto.CategoryRequest;
import com.example.expensemanager.dto.CategoryResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    public CategoryService(CategoryRepository categoryRepository,ExpenseRepository expenseRepository) {
        this.categoryRepository = categoryRepository;
        this.expenseRepository=expenseRepository;
    }

    // creating new category

    public Category createCategory(CategoryRequest categoryRequest) {

        Category category = new Category();

        category.setName(categoryRequest.getName());

        return categoryRepository.save(category);
    }

//get all categories
    public List<CategoryResponse> getAllCategories() {

        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(category -> {

                    CategoryResponse response = new CategoryResponse();

                    response.setId(category.getId());
                    response.setName(category.getName());

                    return response;
                })
                .toList();
    }
//get category by id
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException("Category not found with id: " + id)
                );

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());

        return response;
    }

    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest categoryRequest) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        category.setName(categoryRequest.getName());

        Category updatedCategory =
                categoryRepository.save(category);

        CategoryResponse response = new CategoryResponse();

        response.setId(updatedCategory.getId());
        response.setName(updatedCategory.getName());

        return response;
    }
//delete category
public void deleteCategory(Long id) {

    Category category = categoryRepository.findById(id)
            .orElseThrow(() ->
                    new CategoryNotFoundException(
                            "Category not found with id: " + id
                    )
            );

    boolean hasExpenses =
            expenseRepository.existsByCategory(category);

    if (hasExpenses) {
        throw new CategoryHasExpensesException(
                "Category cannot be deleted because expenses are linked to it"
        );
    }

    categoryRepository.delete(category);
}
}
