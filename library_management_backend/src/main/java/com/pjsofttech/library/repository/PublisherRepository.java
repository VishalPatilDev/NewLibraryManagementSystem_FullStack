package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Long> {
    Optional<Publisher> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    Page<Publisher> findByNameContainingIgnoreCase(String name, Pageable pageable);
}