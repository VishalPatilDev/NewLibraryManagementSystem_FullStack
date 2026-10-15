package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.CreateMemberAdminRequest;
import com.pjsofttech.library.dto.request.MemberRequest;
import com.pjsofttech.library.dto.response.MemberResponse;
import com.pjsofttech.library.model.MemberStatus;
import com.pjsofttech.library.model.MemberType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {
//    MemberResponse register(MemberRequest request);
    MemberResponse getById(Long id);
    MemberResponse getByUserId(Long userId);
    MemberResponse getByMembershipNumber(String membershipNumber);
    Page<MemberResponse> getAll(Pageable pageable);
    Page<MemberResponse> search(String keyword, Pageable pageable);
    MemberResponse update(Long id, MemberRequest request);
    MemberResponse updateStatus(Long id, MemberStatus status);
    void delete(Long id);
    MemberResponse registerMember(CreateMemberAdminRequest request);

    MemberResponse updateType(Long id, MemberType memberType);
}