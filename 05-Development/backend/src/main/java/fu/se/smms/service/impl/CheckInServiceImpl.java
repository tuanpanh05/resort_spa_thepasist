package fu.se.smms.service.impl;

import fu.se.smms.dto.ArrivalDTO;
import fu.se.smms.entity.Room;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.RoomBookingDetail;
import fu.se.smms.entity.User;
import fu.se.smms.entity.RoomType;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.repository.RoomRepository;
import fu.se.smms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    @Autowired
    private UserRepository userRepository;

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

        // 2b. Only allow check-in on or after check-in date
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate checkInDate = booking.getCheckInDate() != null ? booking.getCheckInDate().toLocalDate() : today;
        if (today.isBefore(checkInDate)) {
            throw new BusinessException(
                    "CHECKIN-004", HttpStatus.BAD_REQUEST,
                    "Chưa đến ngày nhận phòng (Check-in). Ngày nhận phòng đăng ký: " +
                    checkInDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        // 3. BR-13: Identity document is mandatory (Residence Law 2020)
        if (identityDocument == null || identityDocument.isBlank()) {
            throw new BusinessException(
                    "CHECKIN-002", HttpStatus.BAD_REQUEST,
                    "Số CCCD / Hộ chiếu là bắt buộc để làm thủ tục nhận phòng (Luật Cư Trú 2020).");
        }

        // 4. Save identity document to user profile (AES-256 encrypted via AesEncryptor converter)
        User guest = booking.getUser();
        if (guest != null) {
            guest.setIdPassportEncrypted(identityDocument);
            userRepository.save(guest);
        }

        // 5. Update booking status to CHECKED_IN
        booking.setStatus("CHECKED_IN");
        roomBookingRepository.save(booking);

        // 6. BR-13b: Update all rooms linked to booking to OCCUPIED
        List<Room> rooms = roomRepository.findRoomsByBookingId(bookingId);
        for (Room room : rooms) {
            room.setStatus("OCCUPIED");
            roomRepository.save(room);
        }
    }

    /**
     * UC08: Get arrivals dashboard data — all active bookings (CONFIRMED, PENDING_DEPOSIT, CHECKED_IN).
     * Lễ tân can see the list of guests expected to check-in.
     *
     * @return List of ArrivalDTO objects.
     */
    @Transactional(readOnly = true)
    public List<ArrivalDTO> getArrivals() {
        List<RoomBooking> bookings = roomBookingRepository.findAllActiveBookings();
        List<ArrivalDTO> arrivals = new ArrayList<>();

        for (RoomBooking booking : bookings) {
            ArrivalDTO dto = new ArrivalDTO();
            dto.setBookingId(booking.getBookingId());
            dto.setCheckInDate(booking.getCheckInDate());
            dto.setCheckOutDate(booking.getCheckOutDate());
            dto.setDepositPaid(booking.getTotalDeposit());
            dto.setStatus(booking.getStatus());

            // Guest info
            User guest = booking.getUser();
            if (guest != null) {
                dto.setGuestName(guest.getFullName());
                dto.setGuestEmail(guest.getEmail());
                dto.setGuestPhone(guest.getPhone());
            }

            // Package info
            if (booking.getRetreatPackage() != null) {
                dto.setPackageName(booking.getRetreatPackage().getName());
            }

            // Room info (from all details)
            List<RoomBookingDetail> details = booking.getDetails();
            if (details != null && !details.isEmpty()) {
                String roomNumbers = details.stream()
                        .map(RoomBookingDetail::getRoom)
                        .filter(java.util.Objects::nonNull)
                        .map(Room::getRoomNumber)
                        .collect(java.util.stream.Collectors.joining(", "));
                dto.setRoomNumber(roomNumbers);

                String roomTypes = details.stream()
                        .map(RoomBookingDetail::getRoom)
                        .filter(java.util.Objects::nonNull)
                        .map(Room::getRoomType)
                        .filter(java.util.Objects::nonNull)
                        .map(RoomType::getTypeName)
                        .distinct()
                        .collect(java.util.stream.Collectors.joining(", "));
                dto.setRoomTypeName(roomTypes);
            }

            arrivals.add(dto);
        }

        return arrivals;
    }
}
