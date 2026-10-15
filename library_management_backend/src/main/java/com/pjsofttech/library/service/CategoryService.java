package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.CategoryRequest;
import com.pjsofttech.library.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAll();
    Page<CategoryResponse> getAllPaged(Pageable pageable);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}