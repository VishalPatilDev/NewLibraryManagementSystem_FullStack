package com.pjsofttech.library.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Rack — represents a physical rack/shelf in the school library.
 * School libraries are organized by racks with shelf numbers.
 * Example: Rack A - Row 1 holds Science books, Rack B - Row 2 holds Mathematics.
 * BookCopy references a Rack to tell students/staff exactly where to find a book physically.
 * Relationship: Rack (1) → BookCopy (Many)
 */
@Entity
@Table(name = "racks")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(exclude = "bookCopies")
@ToString(exclude = "bookCopies")
public class Rack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Rack code — unique identifier like "A1", "B3", "SCIENCE-01"
     */
    @Column(name = "rack_code", nullable = false, unique = true, length = 20)
    private String rackCode;

    /**
     * Descriptive label: "Science & Technology", "Mathematics", "Fiction"
     */
    @Column(name = "label", nullable = false, length = 100)
    private String label;

    /**
     * Optional: which section/wing of the library this rack is in
     * e.g. "Ground Floor - East Wing", "First Floor - Reference Section"
     */
    @Column(name = "floor_section", length = 100)
    private String floorSection;


    @Column(name = "section", length = 100)
    private String section;

    @Column(name = "row_num")
    private Integer rowNumber;

    @Column(name = "total_capacity")
    private Integer totalCapacity;           // max number of books this rack can hold

    @Column(name = "description", length = 300)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "rack", fetch = FetchType.LAZY)
    @Builder.Default
    private List<BookCopy> bookCopies = new ArrayList<>();
}