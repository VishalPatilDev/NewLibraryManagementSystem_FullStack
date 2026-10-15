//package com.pjsofttech.library.service;
//
//import com.pjsofttech.library.dto.request.BookRequest;
//import com.pjsofttech.library.dto.response.BookResponse;
//import com.pjsofttech.library.exception.DuplicateResourceException;
//import com.pjsofttech.library.exception.ResourceNotFoundException;
//import com.pjsofttech.library.model.*;
//import com.pjsofttech.library.repository.*;
//import com.pjsofttech.library.service.impl.BookServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.test.util.ReflectionTestUtils;
//
//import java.util.HashSet;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("BookService Unit Tests")
//class BookServiceTest {
//
//    @Mock private BookRepository bookRepository;
//    @Mock private AuthorRepository authorRepository;
//    @Mock private CategoryRepository categoryRepository;
//    @Mock private BookCopyRepository bookCopyRepository;
//
//    @InjectMocks
//    private BookServiceImpl bookService;
//
//    private Author author;
//    private Category category;
//    private BookRequest validRequest;
//
//    @BeforeEach
//    void setUp() {
//        author = Author.builder().id(1L).name("Robert C. Martin").build();
//        category = Category.builder().id(1L).name("Programming").build();
//
//        validRequest = new BookRequest();
//        validRequest.setTitle("Clean Code");
//        validRequest.setIsbn("9780132350884");
//        validRequest.setPublicationYear(2008);
//        validRequest.setLanguage("English");
//        validRequest.setPublisher("Prentice Hall");
//        validRequest.setCategoryId(1L);
//        validRequest.setAuthorIds(Set.of(1L));
//    }
//
//    @Test
//    @DisplayName("Should create a book successfully")
//    void createBook_success() {
//        when(bookRepository.existsByIsbn(anyString())).thenReturn(false);
//        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
//        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));
//        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> {
//            Book b = inv.getArgument(0);
//            ReflectionTestUtils.setField(b, "id", 1L);
//            b.setAuthors(new HashSet<>(Set.of(author)));
//            b.setCategory(category);
//            return b;
//        });
//
//        BookResponse response = bookService.create(validRequest);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getTitle()).isEqualTo("Clean Code");
//        assertThat(response.getIsbn()).isEqualTo("9780132350884");
//        assertThat(response.getAuthors()).hasSize(1);
//        verify(bookRepository).save(any(Book.class));
//    }
//
//    @Test
//    @DisplayName("Should throw DuplicateResourceException when ISBN already exists")
//    void createBook_duplicateIsbn_throws() {
//        when(bookRepository.existsByIsbn("9780132350884")).thenReturn(true);
//
//        assertThatThrownBy(() -> bookService.create(validRequest))
//                .isInstanceOf(DuplicateResourceException.class)
//                .hasMessageContaining("9780132350884");
//    }
//
//    @Test
//    @DisplayName("Should throw ResourceNotFoundException when author not found")
//    void createBook_authorNotFound_throws() {
//        when(bookRepository.existsByIsbn(anyString())).thenReturn(false);
//        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
//        when(authorRepository.findById(1L)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> bookService.create(validRequest))
//                .isInstanceOf(ResourceNotFoundException.class);
//    }
//
//    @Test
//    @DisplayName("Should throw ResourceNotFoundException when category not found")
//    void createBook_categoryNotFound_throws() {
//        when(bookRepository.existsByIsbn(anyString())).thenReturn(false);
//        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> bookService.create(validRequest))
//                .isInstanceOf(ResourceNotFoundException.class);
//    }
//
//    @Test
//    @DisplayName("Should throw ResourceNotFoundException when getting non-existent book")
//    void getById_notFound_throws() {
//        when(bookRepository.findById(99L)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> bookService.getById(99L))
//                .isInstanceOf(ResourceNotFoundException.class)
//                .hasMessageContaining("99");
//    }
//
//    @Test
//    @DisplayName("Should delete book successfully")
//    void deleteBook_success() {
//        Book book = Book.builder().id(1L).title("Clean Code").isbn("123")
//                .authors(new HashSet<>()).build();
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        doNothing().when(bookRepository).delete(book);
//
//        assertThatCode(() -> bookService.delete(1L)).doesNotThrowAnyException();
//        verify(bookRepository).delete(book);
//    }
//}