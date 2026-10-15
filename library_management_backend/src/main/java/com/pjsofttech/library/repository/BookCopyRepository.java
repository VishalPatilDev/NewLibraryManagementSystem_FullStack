package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.BookCopy;
import com.pjsofttech.library.model.CopyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    Optional<BookCopy> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);
    List<BookCopy> findByBookId(Long bookId);
    List<BookCopy> findByBookIdAndStatus(Long bookId, CopyStatus status);
    Optional<BookCopy> findFirstByBookIdAndStatus(Long bookId, CopyStatus status);
    long countByBookIdAndStatus(Long bookId, CopyStatus status);
}