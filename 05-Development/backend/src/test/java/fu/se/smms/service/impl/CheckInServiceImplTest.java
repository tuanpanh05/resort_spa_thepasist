package fu.se.smms.service.impl;

import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TDD Unit Tests for CheckInServiceImpl.
 * NOTE: Uses Room (entity) and RoomRepository as they exist in this project —
 *       NOT Villa/VillaRepository which do not exist.
 *
 * Covers:
 *   RESORT-M2-TC-004 — Fail check-in when identity details (CCCD/Passport) are missing
 *   RESORT-M2-TC-005 — Successfully check-in and update Room status to OCCUPIED
 */
class CheckInServiceImplTest {

    private RoomBookingRepository roomBookingRepository;
    private RoomRepository roomRepository;
    private CheckInServiceImpl checkInService;

    @BeforeEach
    void setUp() {
        roomBookingRepository = mock(RoomBookingRepository.class);
        roomRepository = mock(RoomRepository.class);
        checkInService = new CheckInServiceImpl();
        ReflectionTestUtils.setField(checkInService, "roomBookingRepository", roomBookingRepository);
        ReflectionTestUtils.setField(checkInService, "roomRepository", roomRepository);
    }

    // ─── TC-004 ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RESORT-M2-TC-004: Fail check-in when identity card/passport is null")
    void performCheckIn_missingIdentity_throwsBadRequest() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(202);
        booking.setStatus("CONFIRMED");

        when(roomBookingRepository.findById(202)).thenReturn(Optional.of(booking));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () ->
                checkInService.performCheckIn(202, null, "Vietnamese")
        );

        assertEquals("CHECKIN-002", exception.getCode());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(roomBookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("RESORT-M2-TC-004: Fail check-in when identity card/passport is blank")
    void performCheckIn_blankIdentity_throwsBadRequest() {
        // Arrange
        RoomBooking booking = new RoomBooking();
        booking.setBookingId(203);
        booking.setStatus("CONFIRMED");

        when(roomBookingRepository.findById(203)).thenReturn(Optional.of(booking));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () ->
                checkInService.performCheckIn(203, "   ", "Vietnamese")
        );

        assertEquals("CHECKIN-002", exception.getCode());
        verify(roomBookingRepository, never()).save(any());
    }

    // ─── TC-005 ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RESORT-M2-TC-005: Check-in success — Room status updated to OCCUPIED")
    void performCheckIn_validData_updatesRoomToOccupied() {
        // Arrange
        Room room = new Room();
        room.setRoomId(2);
        room.setRoomNumber("Villa-101");
        room.setStatus("AVAILABLE");

        RoomBooking booking = new RoomBooking();
        booking.setBookingId(202);
        booking.setStatus("CONFIRMED");

        when(roomBookingRepository.findById(202)).thenReturn(Optional.of(booking));
        when(roomBookingRepository.save(any(RoomBooking.class))).thenAnswer(i -> i.getArgument(0));
        // Simulate finding rooms linked to this booking (via room_booking_detail)
        when(roomRepository.findRoomsByBookingId(202)).thenReturn(List.of(room));
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        checkInService.performCheckIn(202, "CCCD123456789", "Vietnamese");

        // Assert
        assertEquals("CHECKED_IN", booking.getStatus(),
                "Booking status must change to CHECKED_IN after successful check-in");
        assertEquals("OCCUPIED", room.getStatus(),
                "Room status must change to OCCUPIED after check-in (BR-13)");

        verify(roomBookingRepository).save(booking);
        verify(roomRepository).save(room);
    }
}
