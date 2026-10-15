package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.AuthorRequest;
import com.pjsofttech.library.dto.response.AuthorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthorService {
    AuthorResponse create(AuthorRequest request);
    AuthorResponse getById(Long id);
    Page<AuthorResponse> getAll(Pageable pageable);
    Page<AuthorResponse> searchByName(String name, Pageable pageable);
    AuthorResponse update(Long id, AuthorRequest request);
    void delete(Long id);
}