package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.CreateMemberAdminRequest;
import com.pjsofttech.library.dto.request.MemberRequest;
import com.pjsofttech.library.dto.response.MemberResponse;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.AcademicYearRepository;
import com.pjsofttech.library.repository.MemberRepository;
import com.pjsofttech.library.repository.UserRepository;
import com.pjsofttech.library.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AcademicYearRepository academicYearRepository;

//    @Override
//    @Transactional
//    public MemberResponse register(MemberRequest request) {
//        if (memberRepository.existsByUserId(request.getUserId())) {
//            throw new DuplicateResourceException("User is already a member");
//        }
//        User user = userRepository.findById(request.getUserId())
//                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
//
//        String membershipNumber = generateMembershipNumber();
//
//        Member member = Member.builder()
//                .user(user)
//                .membershipNumber(membershipNumber)
//                .phone(request.getPhone())
//                .address(request.getAddress())
//                .membershipDate(LocalDate.now())
//                .membershipExpiryDate(request.getMembershipExpiryDate())
//                .status(MemberStatus.ACTIVE)
//                .build();
//
//        Member saved = memberRepository.save(member);
//        log.info("Member registered: membershipNumber={}, userId={}", saved.getMembershipNumber(), user.getId());
//        return toResponse(saved);
//    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse getByUserId(Long userId) {
        return toResponse(memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member for userId", userId)));
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse getByMembershipNumber(String membershipNumber) {
        return toResponse(memberRepository.findByMembershipNumber(membershipNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "membershipNumber", membershipNumber)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponse> getAll(Pageable pageable) {
        return memberRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MemberResponse> search(String keyword, Pageable pageable) {
        return memberRepository.searchMembers(keyword, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public MemberResponse update(Long id, MemberRequest request) {
        Member member = findById(id);
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setMembershipExpiryDate(request.getMembershipExpiryDate());
        return toResponse(memberRepository.save(member));
    }

    @Override
    @Transactional
    public MemberResponse updateStatus(Long id, MemberStatus status) {
        Member member = findById(id);
        member.setStatus(status);
        log.info("Member status updated: id={}, status={}", id, status);
        return toResponse(memberRepository.save(member));
    }

    @Override
    public MemberResponse updateType(Long id, MemberType memberType) {
        Member member = findById(id);
        member.setMemberType(memberType);
        log.info("Member type updated: id={}, memberType={}", id, memberType);
        return toResponse(memberRepository.save(member));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        memberRepository.delete(findById(id));
        log.info("Member deleted: id={}", id);
    }

    @Override
    public MemberResponse registerMember(CreateMemberAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }


        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(()-> new RuntimeException("Academic Year Not Found !"));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .role(Role.MEMBER)       // IMPORTANT
                .active(true)
                .build();

        userRepository.save(user);

        Member member = Member.builder()
                .user(user)
                .phone(request.getPhone())
                .address(request.getAddress())
                .academicYear(academicYear)
                .membershipNumber(generateMembershipNumber())
                .membershipDate(LocalDate.now())
                .membershipExpiryDate(LocalDate.now().plusYears(1))
                .status(MemberStatus.ACTIVE)
                .build();

        memberRepository.save(member);

        return toResponse(member);
    }



    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
    }

    private String generateMembershipNumber() {
        String number;
        do {
            number = "LIB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (memberRepository.existsByMembershipNumber(number));
        return number;
    }

    public MemberResponse toResponse(Member m) {
        return MemberResponse.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .userName(m.getUser().getName())
                .userEmail(m.getUser().getEmail())
                .membershipNumber(m.getMembershipNumber())
                .phone(m.getPhone())
                .address(m.getAddress())
                .academicYear(m.getAcademicYear())
                .membershipDate(m.getMembershipDate())
                .membershipExpiryDate(m.getMembershipExpiryDate())
                .status(m.getStatus())
                .memberType(m.getMemberType())
                .createdAt(m.getCreatedAt())
                .build();
    }
}