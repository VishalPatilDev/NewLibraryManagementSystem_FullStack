package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.AuthorRequest;
import com.pjsofttech.library.dto.response.AuthorResponse;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.Author;
import com.pjsofttech.library.repository.AuthorRepository;
import com.pjsofttech.library.service.AuthorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;

    @Override
    @Transactional
    public AuthorResponse create(AuthorRequest request) {
        if (authorRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Author with name '" + request.getName() + "' already exists");
        }
        Author author = Author.builder()
                .name(request.getName())
                .biography(request.getBiography())
                .nationality(request.getNationality())
                .build();
        Author saved = authorRepository.save(author);
        log.info("Author created: {}", saved.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorResponse> getAll(Pageable pageable) {
        return authorRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorResponse> searchByName(String name, Pageable pageable) {
        return authorRepository.findByNameContainingIgnoreCase(name, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public AuthorResponse update(Long id, AuthorRequest request) {
        Author author = findById(id);
        if (!author.getName().equalsIgnoreCase(request.getName())
                && authorRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Author with name '" + request.getName() + "' already exists");
        }
        author.setName(request.getName());
        author.setBiography(request.getBiography());
        author.setNationality(request.getNationality());
        return toResponse(authorRepository.save(author));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Author author = findById(id);
        authorRepository.delete(author);
        log.info("Author deleted: id={}", id);
    }

    private Author findById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author", id));
    }

    private AuthorResponse toResponse(Author a) {
        return AuthorResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .biography(a.getBiography())
                .nationality(a.getNationality())
                .createdAt(a.getCreatedAt())
                .build();
    }
}