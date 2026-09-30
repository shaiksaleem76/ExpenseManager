package com.example.expensemanager.controller;

import com.example.expensemanager.Entity.Category;
import com.example.expensemanager.dto.CategoryRequest;
import com.example.expensemanager.dto.CategoryResponse;
import com.example.expensemanager.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody CategoryRequest categoryRequest) {

        Category category =
                categoryService.createCategory(categoryRequest);

        return ResponseEntity.ok(category);
    }
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {

        List<CategoryResponse> categories =
                categoryService.getAllCategories();

        return ResponseEntity.ok(categories);
    }
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id) {

        CategoryResponse category =
                categoryService.getCategoryById(id);

        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest categoryRequest) {

        CategoryResponse category =
                categoryService.updateCategory(id, categoryRequest);

        return ResponseEntity.ok(category);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id) {

        categoryService.deleteCategory(id);

        return ResponseEntity.ok(
                "Category deleted successfully"
        );
    }
}
