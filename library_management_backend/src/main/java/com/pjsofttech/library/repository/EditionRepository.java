package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Edition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EditionRepository extends JpaRepository<Edition, Long> {

    List<Edition> findByBookIdOrderByEditionNumberDesc(Long bookId);

    Optional<Edition> findByBookIdAndEditionNumber(Long bookId, Integer editionNumber);

    Optional<Edition> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    @Query("SELECT e FROM Edition e WHERE e.book.id = :bookId AND e.isLatest = true")
    Optional<Edition> findLatestEditionByBookId(@Param("bookId") Long bookId);

    @Query("SELECT COUNT(e) FROM Edition e WHERE e.book.id = :bookId")
    long countEditionsByBookId(@Param("bookId") Long bookId);
}