package com.pjsofttech.library.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Edition — represents a specific edition of a Book.
 * Critical for school libraries: "Mathematics Class 10 - 3rd Edition" and
 * "Mathematics Class 10 - 4th Edition" are the same book but different editions.
 * Each edition can have its own copies, price, and publication date.
 * Relationship: Book (1) → Edition (Many)
 */
@Entity
@Table(name = "editions", indexes = {
        @Index(name = "idx_edition_book", columnList = "book_id"),
        @Index(name = "idx_edition_number", columnList = "edition_number")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Edition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "edition_number", nullable = false)
    private Integer editionNumber;           // e.g. 1, 2, 3

    @Column(name = "edition_label", length = 50)
    private String editionLabel;             // e.g. "3rd Edition", "Revised Edition"

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "publication_date")
    private LocalDate publicationDate;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;                // purchase price for this edition

    @Column(name = "isbn", length = 20, unique = true)
    private String isbn;                     // Each edition can have its own ISBN

    @Column(name = "total_copies", nullable = false)
    @Builder.Default
    private Integer totalCopies = 0;

    @Column(name = "available_copies", nullable = false)
    @Builder.Default
    private Integer availableCopies = 0;

    @Column(name = "is_latest", nullable = false)
    @Builder.Default
    private Boolean isLatest = false;        // flag to mark the latest edition

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}