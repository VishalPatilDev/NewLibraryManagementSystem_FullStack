package com.pjsofttech.library.repository;

import com.pjsofttech.library.model.Member;
import com.pjsofttech.library.model.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMembershipNumber(String membershipNumber);
    Optional<Member> findByUserId(Long userId);
    boolean existsByMembershipNumber(String membershipNumber);
    boolean existsByUserId(Long userId);
    Page<Member> findByStatus(MemberStatus status, Pageable pageable);

    @Query("SELECT m FROM Member m JOIN m.user u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%',:kw,'%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%',:kw,'%')) OR " +
            "LOWER(m.membershipNumber) LIKE LOWER(CONCAT('%',:kw,'%'))")
    Page<Member> searchMembers(@Param("kw") String keyword, Pageable pageable);
}