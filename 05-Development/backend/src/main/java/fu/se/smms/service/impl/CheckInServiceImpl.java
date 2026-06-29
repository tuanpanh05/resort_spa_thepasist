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
import java.util.Set;
import java.util.HashSet;
import fu.se.smms.dto.CheckInRequestDTO;
import fu.se.smms.dto.GuestResidencyDTO;

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

    @Autowired
    private fu.se.smms.repository.AccompanyingGuestRepository accompanyingGuestRepository;

    /**
     * Perform guest check-in.
     *
     * @param bookingId        The booking ID to check in.
     * @param identityDocument CCCD or Passport number of the primary guest (must not be null/blank).
     * @param nationality      Nationality of the primary guest.
     * @param accompanyingGuests Accompanying guests lists.
     */
    @Transactional
    public void performCheckIn(CheckInRequestDTO request) {
        Integer bookingId = request.getBookingId();
        String identityDocument = request.getIdentityDocument();
        String nationality = request.getNationality();
        String documentType = request.getDocumentType();
        List<fu.se.smms.dto.AccompanyingGuestDTO> accompanyingGuests = request.getAccompanyingGuests();

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

        // Validate document formats
        validateDocument(identityDocument, documentType);
        if (accompanyingGuests != null) {
            for (fu.se.smms.dto.AccompanyingGuestDTO dto : accompanyingGuests) {
                if (dto.getIdentityDocument() != null && !dto.getIdentityDocument().isBlank()) {
                    validateDocument(dto.getIdentityDocument(), dto.getDocumentType());
                }
            }
        }

        // Check duplicate document numbers within the check-in request (form)
        Set<String> requestDocs = new HashSet<>();
        requestDocs.add(identityDocument.trim());
        if (accompanyingGuests != null) {
            for (fu.se.smms.dto.AccompanyingGuestDTO dto : accompanyingGuests) {
                String doc = dto.getIdentityDocument() != null ? dto.getIdentityDocument().trim() : "";
                if (!doc.isEmpty()) {
                    if (!requestDocs.add(doc)) {
                        throw new BusinessException("CHECKIN-007", HttpStatus.BAD_REQUEST,
                                "Phát hiện trùng lặp Số CCCD / Hộ chiếu '" + doc + "' trong danh sách khách check-in.");
                    }
                }
            }
        }

        // Check duplicate document numbers in Database of dependents (excluding current booking)
        for (String doc : requestDocs) {
            if (accompanyingGuestRepository.existsByIdentityDocumentAndBookingIdNot(doc, bookingId)) {
                throw new BusinessException("CHECKIN-005", HttpStatus.CONFLICT,
                        "Số CCCD / Hộ chiếu '" + doc + "' đã được sử dụng check-in ở một đặt phòng khác trong hệ thống.");
            }
        }

        // 4. Save identity document to user profile (AES-256 encrypted via AesEncryptor converter)
        User guest = booking.getUser();
        if (guest != null) {
            guest.setIdPassportEncrypted(identityDocument.trim());
            userRepository.save(guest);
        }

        // 4b. Clear and save accompanying guests (and the main guest)
        List<fu.se.smms.entity.AccompanyingGuest> existing = accompanyingGuestRepository.findByBookingId(bookingId);
        if (existing != null && !existing.isEmpty()) {
            accompanyingGuestRepository.deleteAll(existing);
        }

        // Save main guest as an AccompanyingGuest entry with relationship "Người đăng ký"
        fu.se.smms.entity.AccompanyingGuest mainGuestObj = new fu.se.smms.entity.AccompanyingGuest();
        mainGuestObj.setBookingId(bookingId);
        mainGuestObj.setFullName(guest != null ? guest.getFullName() : "Khách chính");
        mainGuestObj.setIdentityDocument(identityDocument.trim());
        mainGuestObj.setRelationship("Người đăng ký");
        mainGuestObj.setIsChild(false);
        accompanyingGuestRepository.save(mainGuestObj);

        // Save actual accompanying guests
        if (accompanyingGuests != null && !accompanyingGuests.isEmpty()) {
            for (fu.se.smms.dto.AccompanyingGuestDTO dto : accompanyingGuests) {
                if (dto.getFullName() == null || dto.getFullName().isBlank()) continue;
                fu.se.smms.entity.AccompanyingGuest guestObj = new fu.se.smms.entity.AccompanyingGuest();
                guestObj.setBookingId(bookingId);
                guestObj.setFullName(dto.getFullName().trim());
                guestObj.setIdentityDocument(dto.getIdentityDocument() != null ? dto.getIdentityDocument().trim() : null);
                guestObj.setRelationship(dto.getRelationship() != null ? dto.getRelationship().trim() : null);
                guestObj.setIsChild(dto.getIsChild() != null ? dto.getIsChild() : false);
                accompanyingGuestRepository.save(guestObj);
            }
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

    private void validateDocument(String doc, String docType) {
        if (doc == null || doc.isBlank()) {
            return;
        }
        String cleanDoc = doc.trim();
        if ("PASSPORT".equalsIgnoreCase(docType)) {
            if (!cleanDoc.matches("^[A-Z0-9]{1,9}$")) {
                throw new BusinessException("CHECKIN-008", HttpStatus.BAD_REQUEST,
                        "Số Hộ chiếu không hợp lệ: '" + cleanDoc + "'. Hộ chiếu chỉ được chứa ký tự viết hoa và chữ số, tối đa 9 ký tự.");
            }
        } else {
            // Default to CCCD validation
            if (!cleanDoc.matches("^0\\d{11}$")) {
                throw new BusinessException("CHECKIN-009", HttpStatus.BAD_REQUEST,
                        "Số Căn cước công dân không hợp lệ: '" + cleanDoc + "'. CCCD phải có đúng 12 chữ số và bắt đầu bằng số 0.");
            }
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
            dto.setSpecialRequests(booking.getSpecialRequests());
            dto.setGuestsCount(booking.getGuestsCount());
            dto.setChildrenCount(booking.getChildrenCount());

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

    @Transactional(readOnly = true)
    public List<GuestResidencyDTO> getAllGuests() {
        List<fu.se.smms.entity.AccompanyingGuest> guests = accompanyingGuestRepository.findAll();
        List<GuestResidencyDTO> arrivals = new ArrayList<>();

        for (fu.se.smms.entity.AccompanyingGuest g : guests) {
            GuestResidencyDTO dto = new GuestResidencyDTO();
            dto.setGuestId(g.getGuestId());
            dto.setBookingId(g.getBookingId());
            dto.setFullName(g.getFullName());
            dto.setIdentityDocument(g.getIdentityDocument());
            dto.setRelationship(g.getRelationship());
            dto.setIsChild(g.getIsChild());
            dto.setCreatedAt(g.getCreatedAt());

            // Fetch booking info
            roomBookingRepository.findById(g.getBookingId()).ifPresent(booking -> {
                User rep = booking.getUser();
                if (rep != null) {
                    dto.setRepresentativeName(rep.getFullName());
                    dto.setRepresentativePhone(rep.getPhone());
                    dto.setRepresentativeEmail(rep.getEmail());
                }

                // Fetch rooms linked to this booking
                List<Room> rooms = roomRepository.findRoomsByBookingId(booking.getBookingId());
                if (rooms != null && !rooms.isEmpty()) {
                    List<String> roomNumbers = new ArrayList<>();
                    for (Room r : rooms) {
                        roomNumbers.add(r.getRoomNumber());
                    }
                    dto.setRoomNumber(String.join(", ", roomNumbers));
                }
            });

            arrivals.add(dto);
        }

        return arrivals;
    }
}
