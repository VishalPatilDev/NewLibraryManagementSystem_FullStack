package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.EditionRequest;
import com.pjsofttech.library.dto.response.EditionResponse;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.Book;
import com.pjsofttech.library.model.Edition;
import com.pjsofttech.library.model.Publisher;
import com.pjsofttech.library.repository.BookRepository;
import com.pjsofttech.library.repository.EditionRepository;
import com.pjsofttech.library.repository.PublisherRepository;
import com.pjsofttech.library.service.EditionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EditionServiceImpl implements EditionService {

    private final EditionRepository editionRepository;
    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;

    @Override
    @Transactional
    public EditionResponse create(EditionRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        if (editionRepository.findByBookIdAndEditionNumber(book.getId(), request.getEditionNumber()).isPresent()) {
            throw new DuplicateResourceException("Edition " + request.getEditionNumber()
                    + " already exists for book '" + book.getTitle() + "'");
        }
        if (request.getIsbn() != null && editionRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("ISBN '" + request.getIsbn() + "' already exists");
        }

        Publisher publisher = null;
        if (request.getPublisherId() != null) {
            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publisher", request.getPublisherId()));
        }

        // If marking as latest, unmark all others for this book
        if (Boolean.TRUE.equals(request.getIsLatest())) {
            unmarkLatestForBook(book.getId());
        }

        Edition edition = Edition.builder()
                .book(book)
                .editionNumber(request.getEditionNumber())
                .editionLabel(request.getEditionLabel())
                .publicationYear(request.getPublicationYear())
                .publicationDate(request.getPublicationDate())
                .price(request.getPrice())
                .isbn(request.getIsbn())
                .isLatest(Boolean.TRUE.equals(request.getIsLatest()))
                .publisher(publisher)
                .build();

        Edition saved = editionRepository.save(edition);
        log.info("Edition {} created for book '{}'", saved.getEditionNumber(), book.getTitle());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EditionResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EditionResponse> getByBook(Long bookId) {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
        return editionRepository.findByBookIdOrderByEditionNumberDesc(bookId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EditionResponse getLatestEdition(Long bookId) {
        return toResponse(editionRepository.findLatestEditionByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("No latest edition found for book " + bookId)));
    }

    @Override
    @Transactional
    public EditionResponse update(Long id, EditionRequest request) {
        Edition edition = findById(id);

        if (request.getIsbn() != null && !request.getIsbn().equals(edition.getIsbn())
                && editionRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("ISBN '" + request.getIsbn() + "' already exists");
        }
        if (Boolean.TRUE.equals(request.getIsLatest()) && !Boolean.TRUE.equals(edition.getIsLatest())) {
            unmarkLatestForBook(edition.getBook().getId());
        }

        Publisher publisher = null;
        if (request.getPublisherId() != null) {
            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publisher", request.getPublisherId()));
        }

        edition.setEditionLabel(request.getEditionLabel());
        edition.setPublicationYear(request.getPublicationYear());
        edition.setPublicationDate(request.getPublicationDate());
        edition.setPrice(request.getPrice());
        edition.setIsbn(request.getIsbn());
        edition.setIsLatest(Boolean.TRUE.equals(request.getIsLatest()));
        edition.setPublisher(publisher);

        return toResponse(editionRepository.save(edition));
    }

    @Override
    @Transactional
    public EditionResponse markAsLatest(Long id) {
        Edition edition = findById(id);
        unmarkLatestForBook(edition.getBook().getId());
        edition.setIsLatest(true);
        return toResponse(editionRepository.save(edition));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Edition edition = findById(id);
        if (edition.getTotalCopies() > 0) {
            throw new BusinessException("Cannot delete edition that has book copies. Remove copies first.");
        }
        editionRepository.delete(edition);
        log.info("Edition id={} deleted", id);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Edition findById(Long id) {
        return editionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Edition", id));
    }

    private void unmarkLatestForBook(Long bookId) {
        editionRepository.findLatestEditionByBookId(bookId).ifPresent(e -> {
            e.setIsLatest(false);
            editionRepository.save(e);
        });
    }

    public EditionResponse toResponse(Edition e) {
        return EditionResponse.builder()
                .id(e.getId())
                .bookId(e.getBook().getId())
                .bookTitle(e.getBook().getTitle())
                .editionNumber(e.getEditionNumber())
                .editionLabel(e.getEditionLabel())
                .publicationYear(e.getPublicationYear())
                .publicationDate(e.getPublicationDate())
                .price(e.getPrice())
                .isbn(e.getIsbn())
                .totalCopies(e.getTotalCopies())
                .availableCopies(e.getAvailableCopies())
                .isLatest(e.getIsLatest())
                .publisherId(e.getPublisher() != null ? e.getPublisher().getId() : null)
                .publisherName(e.getPublisher() != null ? e.getPublisher().getName() : null)
                .createdAt(e.getCreatedAt())
                .build();
    }
}