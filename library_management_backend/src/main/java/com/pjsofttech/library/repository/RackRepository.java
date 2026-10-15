package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Rack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RackRepository extends JpaRepository<Rack, Long> {

    Optional<Rack> findByRackCodeIgnoreCase(String rackCode);

    boolean existsByRackCodeIgnoreCase(String rackCode);

    List<Rack> findBySectionIgnoreCase(String section);

    @Query("SELECT r FROM Rack r WHERE LOWER(r.label) LIKE LOWER(CONCAT('%',:kw,'%')) OR LOWER(r.rackCode) LIKE LOWER(CONCAT('%',:kw,'%'))")
    List<Rack> search(@Param("kw") String keyword);

    @Query("SELECT COUNT(bc) FROM BookCopy bc WHERE bc.rack.id = :rackId")
    long countBooksInRack(@Param("rackId") Long rackId);
}