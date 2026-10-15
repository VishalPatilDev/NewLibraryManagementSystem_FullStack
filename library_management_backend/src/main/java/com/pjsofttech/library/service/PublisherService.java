package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.PublisherRequest;
import com.pjsofttech.library.dto.response.PublisherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PublisherService {
    PublisherResponse create(PublisherRequest request);
    PublisherResponse getById(Long id);
    List<PublisherResponse> getAll();
    Page<PublisherResponse> search(String name, Pageable pageable);
    PublisherResponse update(Long id, PublisherRequest request);
    void delete(Long id);
}