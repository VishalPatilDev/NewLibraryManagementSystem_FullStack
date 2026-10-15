package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.EditionRequest;
import com.pjsofttech.library.dto.response.EditionResponse;
import java.util.List;

public interface EditionService {
    EditionResponse create(EditionRequest request);
    EditionResponse getById(Long id);
    List<EditionResponse> getByBook(Long bookId);
    EditionResponse getLatestEdition(Long bookId);
    EditionResponse update(Long id, EditionRequest request);
    EditionResponse markAsLatest(Long id);
    void delete(Long id);
}