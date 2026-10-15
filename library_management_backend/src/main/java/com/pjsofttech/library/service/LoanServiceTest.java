//package com.pjsofttech.library.service;
//
//import com.pjsofttech.library.dto.request.LoanRequest;
//import com.pjsofttech.library.dto.response.LoanResponse;
//import com.pjsofttech.library.exception.*;
//import com.pjsofttech.library.model.*;
//import com.pjsofttech.library.repository.*;
//import com.pjsofttech.library.service.impl.LoanServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.test.util.ReflectionTestUtils;
//
//import java.time.LocalDate;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("LoanService Unit Tests")
//class LoanServiceTest {
//
//    @Mock private LoanRepository loanRepository;
//    @Mock private MemberRepository memberRepository;
//    @Mock private BookRepository bookRepository;
//    @Mock private BookCopyRepository bookCopyRepository;
//    @Mock private FineService fineService;
//
//    @InjectMocks
//    private LoanServiceImpl loanService;
//
//    private Member activeMember;
//    private Member blockedMember;
//    private Book book;
//    private BookCopy availableCopy;
//    private LoanRequest loanRequest;
//
//    @BeforeEach
//    void setUp() {
//        // Inject @Value fields
//        ReflectionTestUtils.setField(loanService, "loanDurationDays", 14);
//        ReflectionTestUtils.setField(loanService, "maxBooksPerMember", 5);
//        ReflectionTestUtils.setField(loanService, "renewalDays", 7);
//
//        User user = User.builder().id(1L).name("Rahul").email("rahul@test.com")
//                .role(Role.MEMBER).active(true).build();
//
//        activeMember = Member.builder()
//                .id(1L).user(user)
//                .membershipNumber("LIB-001")
//                .status(MemberStatus.ACTIVE)
//                .membershipExpiryDate(LocalDate.now().plusYears(1))
//                .build();
//
//        blockedMember = Member.builder()
//                .id(2L).user(user)
//                .membershipNumber("LIB-002")
//                .status(MemberStatus.BLOCKED)
//                .build();
//
//        Category cat = Category.builder().id(1L).name("Programming").build();
//        book = Book.builder()
//                .id(1L).title("Clean Code").isbn("123456")
//                .category(cat).availableCopies(2).totalCopies(3)
//                .build();
//
//        availableCopy = BookCopy.builder()
//                .id(1L).book(book).barcode("CC-001")
//                .status(CopyStatus.AVAILABLE)
//                .build();
//
//        loanRequest = new LoanRequest();
//        loanRequest.setMemberId(1L);
//        loanRequest.setBookId(1L);
//    }
//
//    // ── Issue Book Tests ──────────────────────────────────────────────────────
//
//    @Test
//    @DisplayName("Should issue book successfully to active member")
//    void issueBook_success() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        when(loanRepository.countActiveLoansForMember(1L)).thenReturn(0L);
//        when(bookCopyRepository.findFirstByBookIdAndStatus(1L, CopyStatus.AVAILABLE))
//                .thenReturn(Optional.of(availableCopy));
//        when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> {
//            Loan l = inv.getArgument(0);
//            ReflectionTestUtils.setField(l, "id", 1L);
//            return l;
//        });
//        when(bookCopyRepository.save(any())).thenReturn(availableCopy);
//        when(bookRepository.save(any())).thenReturn(book);
//
//        LoanResponse response = loanService.issueBook(loanRequest, "librarian@test.com");
//
//        assertThat(response).isNotNull();
//        assertThat(response.getBookTitle()).isEqualTo("Clean Code");
//        assertThat(response.getStatus()).isEqualTo(LoanStatus.ACTIVE);
//        assertThat(response.getDueDate()).isEqualTo(LocalDate.now().plusDays(14));
//        verify(bookCopyRepository).save(argThat(c -> c.getStatus() == CopyStatus.ISSUED));
//    }
//
//    @Test
//    @DisplayName("Should throw MemberBlockedException when member is BLOCKED")
//    void issueBook_blockedMember_throws() {
//        when(memberRepository.findById(2L)).thenReturn(Optional.of(blockedMember));
//        loanRequest.setMemberId(2L);
//
//        assertThatThrownBy(() -> loanService.issueBook(loanRequest, "lib@test.com"))
//                .isInstanceOf(MemberBlockedException.class)
//                .hasMessageContaining("BLOCKED");
//    }
//
//    @Test
//    @DisplayName("Should throw BusinessException when member exceeds borrow limit")
//    void issueBook_exceedsBorrowLimit_throws() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(loanRepository.countActiveLoansForMember(1L)).thenReturn(5L);
//
//        assertThatThrownBy(() -> loanService.issueBook(loanRequest, "lib@test.com"))
//                .isInstanceOf(BusinessException.class)
//                .hasMessageContaining("borrowing limit");
//    }
//
//    @Test
//    @DisplayName("Should throw BookNotAvailableException when no copy is available")
//    void issueBook_noAvailableCopy_throws() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        when(loanRepository.countActiveLoansForMember(1L)).thenReturn(0L);
//        when(bookCopyRepository.findFirstByBookIdAndStatus(1L, CopyStatus.AVAILABLE))
//                .thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> loanService.issueBook(loanRequest, "lib@test.com"))
//                .isInstanceOf(BookNotAvailableException.class);
//    }
//
//    @Test
//    @DisplayName("Should throw ResourceNotFoundException for invalid member")
//    void issueBook_invalidMember_throws() {
//        when(memberRepository.findById(99L)).thenReturn(Optional.empty());
//        loanRequest.setMemberId(99L);
//
//        assertThatThrownBy(() -> loanService.issueBook(loanRequest, "lib@test.com"))
//                .isInstanceOf(ResourceNotFoundException.class);
//    }
//
//    // ── Return Book Tests ─────────────────────────────────────────────────────
//
//    @Test
//    @DisplayName("Should return book successfully with no fine when on time")
//    void returnBook_onTime_noFine() {
//        Loan loan = buildActiveLoan(LocalDate.now().plusDays(5)); // not overdue
//        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
//        when(bookCopyRepository.save(any())).thenReturn(availableCopy);
//        when(bookRepository.save(any())).thenReturn(book);
//        when(loanRepository.save(any())).thenReturn(loan);
//
//        LoanResponse response = loanService.returnBook(1L);
//
//        assertThat(response.getStatus()).isEqualTo(LoanStatus.RETURNED);
//        assertThat(response.getReturnDate()).isEqualTo(LocalDate.now());
//        // Fine should NOT be created for on-time returns
//        verify(fineService, never()).createFine(any(), anyInt());
//    }
//
//    @Test
//    @DisplayName("Should create fine when book is returned overdue")
//    void returnBook_overdue_fineCreated() {
//        Loan loan = buildActiveLoan(LocalDate.now().minusDays(5)); // 5 days overdue
//        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
//        when(bookCopyRepository.save(any())).thenReturn(availableCopy);
//        when(bookRepository.save(any())).thenReturn(book);
//        when(loanRepository.save(any())).thenReturn(loan);
//
//        loanService.returnBook(1L);
//
//        verify(fineService).createFine(loan, 5);
//    }
//
//    @Test
//    @DisplayName("Should throw LoanAlreadyReturnedException when returning an already-returned loan")
//    void returnBook_alreadyReturned_throws() {
//        Loan loan = buildActiveLoan(LocalDate.now().plusDays(5));
//        loan.setStatus(LoanStatus.RETURNED);
//        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
//
//        assertThatThrownBy(() -> loanService.returnBook(1L))
//                .isInstanceOf(LoanAlreadyReturnedException.class);
//    }
//
//    // ── Renew Loan Tests ──────────────────────────────────────────────────────
//
//    @Test
//    @DisplayName("Should renew an active loan and extend due date")
//    void renewLoan_success() {
//        Loan loan = buildActiveLoan(LocalDate.now().plusDays(3));
//        LocalDate originalDueDate = loan.getDueDate();
//        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
//        when(loanRepository.save(any())).thenReturn(loan);
//
//        LoanResponse response = loanService.renewLoan(1L);
//
//        assertThat(response.getDueDate()).isEqualTo(originalDueDate.plusDays(7));
//        assertThat(response.getRenewedCount()).isEqualTo(1);
//    }
//
//    @Test
//    @DisplayName("Should throw BusinessException when renewing a returned loan")
//    void renewLoan_alreadyReturned_throws() {
//        Loan loan = buildActiveLoan(LocalDate.now().plusDays(3));
//        loan.setStatus(LoanStatus.RETURNED);
//        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
//
//        assertThatThrownBy(() -> loanService.renewLoan(1L))
//                .isInstanceOf(BusinessException.class);
//    }
//
//    // ── Helpers ───────────────────────────────────────────────────────────────
//
//    private Loan buildActiveLoan(LocalDate dueDate) {
//        Loan loan = Loan.builder()
//                .member(activeMember)
//                .bookCopy(availableCopy)
//                .issueDate(LocalDate.now().minusDays(14))
//                .dueDate(dueDate)
//                .status(LoanStatus.ACTIVE)
//                .renewedCount(0)
//                .build();
//        ReflectionTestUtils.setField(loan, "id", 1L);
//        return loan;
//    }
//}