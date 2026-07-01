package fu.se.smms.service.impl;

import fu.se.smms.repository.UserRepository;
import fu.se.smms.repository.AccompanyingGuestRepository;
import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.dto.CheckInRequestDTO;
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
    private UserRepository userRepository;
    private AccompanyingGuestRepository accompanyingGuestRepository;
    private CheckInServiceImpl checkInService;

    @BeforeEach
    void setUp() {
        roomBookingRepository = mock(RoomBookingRepository.class);
        roomRepository = mock(RoomRepository.class);
        userRepository = mock(UserRepository.class);
        accompanyingGuestRepository = mock(AccompanyingGuestRepository.class);
        checkInService = new CheckInServiceImpl();
        ReflectionTestUtils.setField(checkInService, "roomBookingRepository", roomBookingRepository);
        ReflectionTestUtils.setField(checkInService, "roomRepository", roomRepository);
        ReflectionTestUtils.setField(checkInService, "userRepository", userRepository);
        ReflectionTestUtils.setField(checkInService, "accompanyingGuestRepository", accompanyingGuestRepository);
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
        CheckInRequestDTO request = new CheckInRequestDTO();
        request.setBookingId(202);
        request.setIdentityDocument(null);
        request.setNationality("Vietnamese");
        request.setAccompanyingGuests(java.util.Collections.emptyList());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                checkInService.performCheckIn(request)
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
        CheckInRequestDTO request = new CheckInRequestDTO();
        request.setBookingId(203);
        request.setIdentityDocument("   ");
        request.setNationality("Vietnamese");
        request.setAccompanyingGuests(java.util.Collections.emptyList());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                checkInService.performCheckIn(request)
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
        room.setRoomNumber("Vip-201");
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
        CheckInRequestDTO request = new CheckInRequestDTO();
        request.setBookingId(202);
        request.setIdentityDocument("012345678901");
        request.setNationality("Vietnamese");
        request.setAccompanyingGuests(java.util.Collections.emptyList());

        checkInService.performCheckIn(request);

        // Assert
        assertEquals("CHECKED_IN", booking.getStatus(),
                "Booking status must change to CHECKED_IN after successful check-in");
        assertEquals("OCCUPIED", room.getStatus(),
                "Room status must change to OCCUPIED after check-in (BR-13)");

        verify(roomBookingRepository).save(booking);
        verify(roomRepository).save(room);
    }
}
