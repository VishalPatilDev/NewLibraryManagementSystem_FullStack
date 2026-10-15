package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.BookCopyRequest;
import com.pjsofttech.library.dto.request.BookRequest;
import com.pjsofttech.library.dto.request.PublisherRequest;
import com.pjsofttech.library.dto.response.*;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.*;
import com.pjsofttech.library.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookCopyRepository bookCopyRepository;
    private final PublisherRepository publisherRepository;
    private final RackRepository rackRepository;

    private PublisherResponse toPublisherResponse(Publisher request){
        return PublisherResponse.builder()
                .id(request.getId())
                .name(request.getName())
                .country(request.getCountry())
                .email(request.getEmail())
                .website(request.getWebsite())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();
    }
    private PublisherRequest toPublisherRequest(Publisher request){
        return PublisherRequest.builder()
                .name(request.getName())
                .country(request.getCountry())
                .email(request.getEmail())
                .website(request.getWebsite())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();
    }

    @Override
    @Transactional
    public BookResponse create(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }
        Book book = Book.builder()
                .title(request.getTitle())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .publicationYear(request.getPublicationYear())
                .language(request.getLanguage())
                .publisher(publisherRepository.findById(request.getPublisherId())
                        .orElseThrow(()->new RuntimeException("Publisher Not Found")))
                .build();

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            book.setCategory(cat);
        }

        Set<Author> authors = resolveAuthors(request.getAuthorIds());
        book.setAuthors(authors);

        Book saved = bookRepository.save(book);
        log.info("Book created: '{}' isbn={}", saved.getTitle(), saved.getIsbn());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> getAll(Pageable pageable) {
        return bookRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = findById(id);
        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }
        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setDescription(request.getDescription());
        book.setPublicationYear(request.getPublicationYear());
        book.setLanguage(request.getLanguage());
        book.setPublisher(publisherRepository.findById(request.getPublisherId()).orElseThrow(()->new RuntimeException("Publisher Not Found")));

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            book.setCategory(cat);
        } else {
            book.setCategory(null);
        }
        book.setAuthors(resolveAuthors(request.getAuthorIds()));
        return toResponse(bookRepository.save(book));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        bookRepository.delete(findById(id));
        log.info("Book deleted: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> search(String title, String isbn, Long categoryId, String language, Pageable pageable) {
        return bookRepository.searchBooks(title, isbn, categoryId, language, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> searchByAuthor(String authorName, Pageable pageable) {
        return bookRepository.findByAuthorName(authorName, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public BookCopyResponse addCopy(BookCopyRequest request) {
        Book book = findById(request.getBookId());
        if (bookCopyRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("Barcode '" + request.getBarcode() + "' already exists");
        }
        BookCopy copy = BookCopy.builder()
                .book(book)
                .barcode(request.getBarcode())
                .status(request.getStatus() != null ? request.getStatus() : CopyStatus.AVAILABLE)
                .rack(rackRepository.findById(request.getRackId())
                        .orElseThrow(()->new RuntimeException("Rack Not Found")))
                .shelfLocation(request.getShelfLocation())
                .purchaseDate(request.getPurchaseDate())
                .build();
        BookCopy saved = bookCopyRepository.save(copy);

        // Update book copy counters
        book.setTotalCopies(book.getTotalCopies() + 1);
        if (saved.getStatus() == CopyStatus.AVAILABLE) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
        }
        bookRepository.save(book);

        log.info("BookCopy added: barcode={} for book '{}'", saved.getBarcode(), book.getTitle());
        return toCopyResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookCopyResponse> getCopiesByBook(Long bookId) {
        findById(bookId); // validate book exists
        return bookCopyRepository.findByBookId(bookId).stream().map(this::toCopyResponse).toList();
    }

    @Override
    @Transactional
    public BookCopyResponse updateCopyStatus(Long copyId, String status) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", copyId));
        try {
            copy.setStatus(CopyStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid copy status: " + status);
        }

        return toCopyResponse(bookCopyRepository.save(copy));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Book findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    private Set<Author> resolveAuthors(Set<Long> ids) {
        Set<Author> authors = new HashSet<>();
        for (Long authorId : ids) {
            Author a = authorRepository.findById(authorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Author", authorId));
            authors.add(a);
        }
        return authors;
    }

    private BookResponse toResponse(Book b) {
        Set<AuthorResponse> authorResponses = b.getAuthors().stream()
                .map(a -> AuthorResponse.builder()
                        .id(a.getId()).name(a.getName())
                        .biography(a.getBiography())
                        .nationality(a.getNationality())
                        .build())
                .collect(Collectors.toSet());

        CategoryResponse catResp = null;
        if (b.getCategory() != null) {
            catResp = CategoryResponse.builder()
                    .id(b.getCategory().getId())
                    .name(b.getCategory().getName())
                    .description(b.getCategory().getDescription())
                    .build();
        }

        return BookResponse.builder()
                .id(b.getId()).title(b.getTitle()).isbn(b.getIsbn())
                .description(b.getDescription())
                .publicationYear(b.getPublicationYear())
                .language(b.getLanguage()).publisher(toPublisherResponse(b.getPublisher()))
                .totalCopies(b.getTotalCopies())
                .availableCopies(b.getAvailableCopies())
                .category(catResp).authors(authorResponses)
                .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .build();
    }

    private BookCopyResponse toCopyResponse(BookCopy c) {
        return BookCopyResponse.builder()
                .id(c.getId())
                .bookId(c.getBook().getId())
                .bookTitle(c.getBook().getTitle())
                .barcode(c.getBarcode())
                .status(c.getStatus())
                .shelfLocation(c.getShelfLocation())
                .purchaseDate(c.getPurchaseDate())
                .createdAt(c.getCreatedAt())
                .build();
    }
}