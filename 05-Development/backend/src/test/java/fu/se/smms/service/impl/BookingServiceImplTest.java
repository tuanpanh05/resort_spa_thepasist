package fu.se.smms.service.impl;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TDD Unit Tests for BookingServiceImpl.
 * Covers RESORT-M2-TC-002 (deposit payment) and RESORT-M2-TC-003 (villa collision).
 */
class BookingServiceImplTest {

    private RoomBookingRepository roomBookingRepository;
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setUp() {
        roomBookingRepository = mock(RoomBookingRepository.class);
        bookingService = new BookingServiceImpl();
        ReflectionTestUtils.setField(bookingService, "roomBookingRepository", roomBookingRepository);
    }

    @Test
    @DisplayName("RESORT-M2-TC-002: Confirm payment successfully when deposit >= 30%")
    void confirmPayment_sufficientDeposit_updatesStatusToConfirmed() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(101);
        booking.setStatus("PENDING_DEPOSIT");
        booking.setCheckInDate(LocalDateTime.now().plusDays(2));
        booking.setCheckOutDate(LocalDateTime.now().plusDays(5));
        
        // Mock a pricing context or package total price. Let's assume total price is 10,000,000 VND
        // Mock repository lookup
        when(roomBookingRepository.findById(101)).thenReturn(Optional.of(booking));
        when(roomBookingRepository.save(any(RoomBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        // Total price = 10,000,000. 30% deposit = 3,000,000. We pay 3,000,000.
        boolean result = bookingService.confirmPayment(101, new BigDecimal("3000000.00"), new BigDecimal("10000000.00"));

        // Assert
        assertTrue(result);
        assertEquals("CONFIRMED", booking.getStatus());
        assertEquals(new BigDecimal("3000000.00"), booking.getTotalDeposit());
        verify(roomBookingRepository).save(booking);
    }

    @Test
    @DisplayName("RESORT-M2-TC-002: Fail payment confirmation when deposit < 30%")
    void confirmPayment_insufficientDeposit_throwsException() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(101);
        booking.setStatus("PENDING_DEPOSIT");

        when(roomBookingRepository.findById(101)).thenReturn(Optional.of(booking));

        // Act & Assert
        // Total = 10,000,000. Paid = 2,900,000 (less than 30%)
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            bookingService.confirmPayment(101, new BigDecimal("2900000.00"), new BigDecimal("10000000.00"));
        });

        assertEquals("BOOKING-002", exception.getCode());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("PENDING_DEPOSIT", booking.getStatus());
        verify(roomBookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("RESORT-M2-TC-003: Prevent booking Villa that is already occupied during the requested dates")
    void createBooking_roomCollision_throwsConflict() {
        // Arrange
        LocalDateTime start = LocalDateTime.of(2026, 6, 20, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 25, 12, 0);

        // Mock overlap check returning true
        when(roomBookingRepository.existsOverlappingBooking(12, start, end)).thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            bookingService.createBooking(1, 2, 12, start, end);
        });

        assertEquals("BOOKING-003", exception.getCode());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }
}
