package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);


    @Query("SELECT DISTINCT b FROM Book b JOIN b.authors a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%',:name,'%'))")
    Page<Book> findByAuthorName(@Param("name") String authorName, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
            "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%',:title,'%'))) AND " +
            "(:isbn IS NULL OR b.isbn = :isbn) AND " +
            "(:categoryId IS NULL OR b.category.id = :categoryId) AND " +
            "(:language IS NULL OR LOWER(b.language) = LOWER(:language))")
    Page<Book> searchBooks(@Param("title") String title,
                           @Param("isbn") String isbn,
                           @Param("categoryId") Long categoryId,
                           @Param("language") String language,
                           Pageable pageable);
}