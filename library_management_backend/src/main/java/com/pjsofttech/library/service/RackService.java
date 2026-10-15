package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.RackRequest;
import com.pjsofttech.library.dto.response.RackResponse;
import java.util.List;

public interface RackService {
    RackResponse create(RackRequest request);
    RackResponse getById(Long id);
    List<RackResponse> getAll();
    List<RackResponse> search(String keyword);
    RackResponse update(Long id, RackRequest request);
    void delete(Long id);
}