package fu.se.smms.service.impl;

import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of check-in logic.
 * Covers RESORT-M2-TC-004 (Identity requirement) and RESORT-M2-TC-005 (Room state → OCCUPIED).
 *
 * Business Rules enforced:
 *   BR-12: Booking must be in CONFIRMED status to check in.
 *   BR-13: Identity document (CCCD / Passport) is mandatory for check-in (Residence Law 2020).
 *   BR-13b: All rooms linked to the booking must be set to OCCUPIED after successful check-in.
 */
@Service
public class CheckInServiceImpl {

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Perform guest check-in.
     *
     * @param bookingId        The booking ID to check in.
     * @param identityDocument CCCD or Passport number of the primary guest (must not be null/blank).
     * @param nationality      Nationality of the primary guest.
     */
    @Transactional
    public void performCheckIn(Integer bookingId, String identityDocument, String nationality) {
        // 1. Lookup booking
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(
                        "CHECKIN-001", HttpStatus.NOT_FOUND,
                        "Không tìm thấy đặt phòng với ID: " + bookingId));

        // 2. BR-12: Booking must be CONFIRMED
        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new BusinessException(
                    "CHECKIN-003", HttpStatus.CONFLICT,
                    "Chỉ có thể làm thủ tục nhận phòng cho đặt phòng ở trạng thái CONFIRMED. " +
                    "Trạng thái hiện tại: " + booking.getStatus());
        }

        // 3. BR-13: Identity document is mandatory (Residence Law 2020)
        if (identityDocument == null || identityDocument.isBlank()) {
            throw new BusinessException(
                    "CHECKIN-002", HttpStatus.BAD_REQUEST,
                    "Số CCCD / Hộ chiếu là bắt buộc để làm thủ tục nhận phòng (Luật Cư Trú 2020).");
        }

        // 4. Update booking status to CHECKED_IN
        booking.setStatus("CHECKED_IN");
        roomBookingRepository.save(booking);

        // 5. BR-13b: Update all rooms linked to booking to OCCUPIED
        List<Room> rooms = roomRepository.findRoomsByBookingId(bookingId);
        for (Room room : rooms) {
            room.setStatus("OCCUPIED");
            roomRepository.save(room);
        }
    }
}
