//package com.pjsofttech.library.service;
//
//import com.pjsofttech.library.dto.request.ReservationRequest;
//import com.pjsofttech.library.dto.response.ReservationResponse;
//import com.pjsofttech.library.exception.*;
//import com.pjsofttech.library.model.*;
//import com.pjsofttech.library.repository.*;
//import com.pjsofttech.library.service.impl.ReservationServiceImpl;
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
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("ReservationService Unit Tests")
//class ReservationServiceTest {
//
//    @Mock private ReservationRepository reservationRepository;
//    @Mock private MemberRepository memberRepository;
//    @Mock private BookRepository bookRepository;
//    @Mock private BookCopyRepository bookCopyRepository;
//
//    @InjectMocks
//    private ReservationServiceImpl reservationService;
//
//    private Member activeMember;
//    private Book book;
//    private ReservationRequest request;
//
//    @BeforeEach
//    void setUp() {
//        User user = User.builder().id(1L).name("Rahul").email("rahul@test.com").build();
//        activeMember = Member.builder()
//                .id(1L).user(user)
//                .membershipNumber("LIB-001")
//                .status(MemberStatus.ACTIVE)
//                .build();
//
//        book = Book.builder()
//                .id(1L).title("Clean Code").isbn("123456")
//                .availableCopies(0).totalCopies(2)
//                .build();
//
//        request = new ReservationRequest();
//        request.setMemberId(1L);
//        request.setBookId(1L);
//    }
//
//    @Test
//    @DisplayName("Should create reservation when all copies are unavailable")
//    void reserve_success() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        when(bookCopyRepository.countByBookIdAndStatus(1L, CopyStatus.AVAILABLE)).thenReturn(0L);
//        when(reservationRepository.existsByMemberIdAndBookIdAndStatusIn(anyLong(), anyLong(), anyList()))
//                .thenReturn(false);
//        when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> {
//            Reservation r = inv.getArgument(0);
//            ReflectionTestUtils.setField(r, "id", 1L);
//            ReflectionTestUtils.setField(r, "createdAt", java.time.LocalDateTime.now());
//            return r;
//        });
//
//        ReservationResponse response = reservationService.reserve(request);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getBookTitle()).isEqualTo("Clean Code");
//        assertThat(response.getStatus()).isEqualTo(ReservationStatus.PENDING);
//    }
//
//    @Test
//    @DisplayName("Should throw BusinessException when book has available copies")
//    void reserve_bookAvailable_throws() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        when(reservationRepository.existsByMemberIdAndBookIdAndStatusIn(anyLong(), anyLong(), anyList()))
//                .thenReturn(false);
//        when(bookCopyRepository.countByBookIdAndStatus(1L, CopyStatus.AVAILABLE)).thenReturn(2L);
//
//        assertThatThrownBy(() -> reservationService.reserve(request))
//                .isInstanceOf(BusinessException.class)
//                .hasMessageContaining("available copies");
//    }
//
//    @Test
//    @DisplayName("Should throw DuplicateResourceException when member already has active reservation")
//    void reserve_duplicateReservation_throws() {
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//        when(reservationRepository.existsByMemberIdAndBookIdAndStatusIn(anyLong(), anyLong(), anyList()))
//                .thenReturn(true);
//
//        assertThatThrownBy(() -> reservationService.reserve(request))
//                .isInstanceOf(DuplicateResourceException.class);
//    }
//
//    @Test
//    @DisplayName("Should throw MemberBlockedException for blocked member")
//    void reserve_blockedMember_throws() {
//        activeMember.setStatus(MemberStatus.BLOCKED);
//        when(memberRepository.findById(1L)).thenReturn(Optional.of(activeMember));
//        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
//
//        assertThatThrownBy(() -> reservationService.reserve(request))
//                .isInstanceOf(MemberBlockedException.class);
//    }
//
//    @Test
//    @DisplayName("Should cancel a PENDING reservation")
//    void cancel_success() {
//        Reservation reservation = Reservation.builder()
//                .member(activeMember).book(book)
//                .reservationDate(LocalDate.now())
//                .status(ReservationStatus.PENDING)
//                .build();
//        ReflectionTestUtils.setField(reservation, "id", 1L);
//        ReflectionTestUtils.setField(reservation, "createdAt", java.time.LocalDateTime.now());
//
//        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
//        when(reservationRepository.save(any())).thenReturn(reservation);
//
//        ReservationResponse response = reservationService.cancel(1L);
//
//        assertThat(response.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
//    }
//
//    @Test
//    @DisplayName("Should throw BusinessException when cancelling already-cancelled reservation")
//    void cancel_alreadyCancelled_throws() {
//        Reservation reservation = Reservation.builder()
//                .member(activeMember).book(book)
//                .reservationDate(LocalDate.now())
//                .status(ReservationStatus.CANCELLED)
//                .build();
//        ReflectionTestUtils.setField(reservation, "id", 1L);
//
//        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
//
//        assertThatThrownBy(() -> reservationService.cancel(1L))
//                .isInstanceOf(BusinessException.class);
//    }
//}