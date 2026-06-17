package fu.se.smms.service.impl;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.entity.SystemConfiguration;
import fu.se.smms.entity.User;
import fu.se.smms.entity.Room;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomBookingDetailRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.RetreatPackageRepository;
import fu.se.smms.repository.SystemConfigurationRepository;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.dto.InvoiceDTO;
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
    private RoomBookingDetailRepository roomBookingDetailRepository;
    private UserRepository userRepository;
    private RoomRepository roomRepository;
    private RetreatPackageRepository retreatPackageRepository;
    private SystemConfigurationRepository systemConfigurationRepository;
    private InvoiceService invoiceService;
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setUp() {
        roomBookingRepository = mock(RoomBookingRepository.class);
        roomBookingDetailRepository = mock(RoomBookingDetailRepository.class);
        userRepository = mock(UserRepository.class);
        roomRepository = mock(RoomRepository.class);
        retreatPackageRepository = mock(RetreatPackageRepository.class);
        systemConfigurationRepository = mock(SystemConfigurationRepository.class);
        invoiceService = mock(InvoiceService.class);

        SystemConfiguration depositConfig = new SystemConfiguration();
        depositConfig.setConfigKey("deposit_ratio");
        depositConfig.setConfigValue("0.30");
        when(systemConfigurationRepository.findByConfigKey("deposit_ratio"))
                .thenReturn(Optional.of(depositConfig));

        bookingService = new BookingServiceImpl();
        ReflectionTestUtils.setField(bookingService, "roomBookingRepository", roomBookingRepository);
        ReflectionTestUtils.setField(bookingService, "roomBookingDetailRepository", roomBookingDetailRepository);
        ReflectionTestUtils.setField(bookingService, "userRepository", userRepository);
        ReflectionTestUtils.setField(bookingService, "roomRepository", roomRepository);
        ReflectionTestUtils.setField(bookingService, "retreatPackageRepository", retreatPackageRepository);
        ReflectionTestUtils.setField(bookingService, "systemConfigurationRepository", systemConfigurationRepository);
        ReflectionTestUtils.setField(bookingService, "invoiceService", invoiceService);
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

        User user = new User();
        user.setUserId(1);
        Room room = new Room();
        room.setRoomId(12);
        RetreatPackage retreatPackage = new RetreatPackage();
        retreatPackage.setPackageId(2);
        retreatPackage.setStatus("ACTIVE");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(roomRepository.findById(12)).thenReturn(Optional.of(room));
        when(retreatPackageRepository.findById(2)).thenReturn(Optional.of(retreatPackage));
        when(roomBookingRepository.countOverlappingBookings(12, start, end)).thenReturn(1);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            bookingService.createBooking(1, 2, 12, start, end);
        });

        assertEquals("BOOKING-003", exception.getCode());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    @DisplayName("UC07: Create package booking sets PENDING_DEPOSIT and generates invoice")
    void createBooking_withActivePackage_createsPendingDepositBooking() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 20, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 25, 12, 0);

        User user = new User();
        user.setUserId(1);

        Room room = new Room();
        room.setRoomId(2);

        RetreatPackage retreatPackage = new RetreatPackage();
        retreatPackage.setPackageId(1);
        retreatPackage.setStatus("ACTIVE");
        retreatPackage.setPrice(new BigDecimal("12500000.00"));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(roomRepository.findById(2)).thenReturn(Optional.of(room));
        when(retreatPackageRepository.findById(1)).thenReturn(Optional.of(retreatPackage));
        when(roomBookingRepository.countOverlappingBookings(2, start, end)).thenReturn(0);
        when(roomBookingRepository.save(any(RoomBooking.class))).thenAnswer(invocation -> {
            RoomBooking saved = invocation.getArgument(0);
            saved.setBookingId(101);
            return saved;
        });
        when(roomBookingDetailRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceService.createInvoice(101)).thenReturn(new InvoiceDTO());

        RoomBooking result = bookingService.createBooking(1, 1, 2, start, end);

        assertEquals("PENDING_DEPOSIT", result.getStatus());
        assertEquals(retreatPackage, result.getRetreatPackage());
        verify(invoiceService).createInvoice(101);
    }
}
