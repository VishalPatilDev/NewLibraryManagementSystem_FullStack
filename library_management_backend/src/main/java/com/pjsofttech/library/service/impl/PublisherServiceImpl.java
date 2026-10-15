package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.PublisherRequest;
import com.pjsofttech.library.dto.response.PublisherResponse;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.Publisher;
import com.pjsofttech.library.repository.PublisherRepository;
import com.pjsofttech.library.service.PublisherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;

    @Override
    @Transactional
    public PublisherResponse create(PublisherRequest request) {
        if (publisherRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Publisher '" + request.getName() + "' already exists");
        }
        Publisher saved = publisherRepository.save(Publisher.builder()
                .name(request.getName())
                .address(request.getAddress())
                .website(request.getWebsite())
                .phone(request.getPhone())
                .email(request.getEmail())
                .country(request.getCountry())
                .build());
        log.info("Publisher created: {}", saved.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PublisherResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublisherResponse> getAll() {
        return publisherRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublisherResponse> search(String name, Pageable pageable) {
        return publisherRepository.findByNameContainingIgnoreCase(name, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public PublisherResponse update(Long id, PublisherRequest request) {
        Publisher p = findById(id);
        if (!p.getName().equalsIgnoreCase(request.getName())
                && publisherRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Publisher '" + request.getName() + "' already exists");
        }
        p.setName(request.getName());
        p.setAddress(request.getAddress());
        p.setWebsite(request.getWebsite());
        p.setPhone(request.getPhone());
        p.setEmail(request.getEmail());
        p.setCountry(request.getCountry());
        return toResponse(publisherRepository.save(p));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        publisherRepository.delete(findById(id));
        log.info("Publisher deleted: id={}", id);
    }

    private Publisher findById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publisher", id));
    }

    public PublisherResponse toResponse(Publisher p) {
        return PublisherResponse.builder()
                .id(p.getId()).name(p.getName()).address(p.getAddress())
                .website(p.getWebsite()).phone(p.getPhone())
                .email(p.getEmail()).country(p.getCountry())
                .createdAt(p.getCreatedAt())
                .build();
    }
}