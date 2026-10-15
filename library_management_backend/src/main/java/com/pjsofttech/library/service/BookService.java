package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.BookCopyRequest;
import com.pjsofttech.library.dto.request.BookRequest;
import com.pjsofttech.library.dto.response.BookCopyResponse;
import com.pjsofttech.library.dto.response.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BookService {
    BookResponse create(BookRequest request);
    BookResponse getById(Long id);
    Page<BookResponse> getAll(Pageable pageable);
    BookResponse update(Long id, BookRequest request);
    void delete(Long id);
    Page<BookResponse> search(String title, String isbn, Long categoryId, String language, Pageable pageable);
    Page<BookResponse> searchByAuthor(String authorName, Pageable pageable);

    // BookCopy operations
    BookCopyResponse addCopy(BookCopyRequest request);
    List<BookCopyResponse> getCopiesByBook(Long bookId);
    BookCopyResponse updateCopyStatus(Long copyId, String status);
}