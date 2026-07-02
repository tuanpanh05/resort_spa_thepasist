package fu.se.smms.service.impl;

import fu.se.smms.dto.*;
import fu.se.smms.entity.*;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.*;
import fu.se.smms.service.SpaBookingService;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.EmailService;
import fu.se.smms.service.GoogleCalendarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpaBookingServiceImpl implements SpaBookingService {

    private static final Logger log = LoggerFactory.getLogger(SpaBookingServiceImpl.class);

    @Autowired
    private SpaBookingRepository spaBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpaServiceRepository spaServiceRepository;

    @Autowired
    private TreatmentRoomRepository treatmentRoomRepository;

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private MedicalProfileRepository medicalProfileRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Override
    @Transactional(readOnly = true)
    public AutoMatchResponseDTO autoMatch(Integer spaServiceId, LocalDateTime startDatetime) {
        SpaService service = spaServiceRepository.findById(spaServiceId)
                .orElseThrow(() -> new BusinessException("SPA-001", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y dá»‹ch vá»¥ Spa."));

        LocalDateTime endDatetime = startDatetime.plusMinutes(service.getDurationMinutes());

        String specialty = normalizeSpecialty(service.getCategory());

        // Specialty-aware matching first
        List<User> availableTherapists = spaBookingRepository.findAvailableTherapistsBySpecialty(specialty, startDatetime, endDatetime);
        List<TreatmentRoom> availableRooms = spaBookingRepository.findAvailableRoomsByCategory(specialty, startDatetime, endDatetime);

        // Graceful fallback to any available if discipline-tagged lists are empty
        if (availableTherapists.isEmpty()) {
            availableTherapists = spaBookingRepository.findAvailableTherapists(startDatetime, endDatetime);
        }
        if (availableRooms.isEmpty()) {
            availableRooms = spaBookingRepository.findAvailableRooms(startDatetime, endDatetime);
        }

        if (availableTherapists.isEmpty()) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, "KhÃ´ng cÃ³ chuyÃªn gia trá»‹ liá»‡u nÃ o trá»‘ng trong khung giá» nÃ y.");
        }
        if (availableRooms.isEmpty()) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, "KhÃ´ng cÃ³ phÃ²ng trá»‹ liá»‡u nÃ o trá»‘ng trong khung giá» nÃ y.");
        }

        User therapist = availableTherapists.get(0);
        TreatmentRoom room = availableRooms.get(0);

        return new AutoMatchResponseDTO(
                therapist.getUserId(),
                therapist.getFullName(),
                room.getTreatmentRoomId(),
                room.getRoomName(),
                startDatetime,
                endDatetime
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAvailableSlots(Integer spaServiceId, LocalDate date, Integer guestsCount) {
        int reqGuests = guestsCount != null ? guestsCount : 1;
        SpaService service = spaServiceRepository.findById(spaServiceId)
                .orElseThrow(() -> new BusinessException("SPA-001", HttpStatus.NOT_FOUND, "Khong tim thay dich vu Spa."));

        int duration = service.getDurationMinutes();
        String specialty = normalizeSpecialty(service.getCategory());

        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalDateTime dayStart = date.atTime(8, 0);
        LocalDateTime dayLimit = date.atTime(20, 0);
        LocalDateTime earliest = LocalDateTime.now().plusMinutes(30);

        for (LocalDateTime slotStart = dayStart;
             !slotStart.plusMinutes(duration).isAfter(dayLimit);
             slotStart = slotStart.plusMinutes(30)) {

            if (slotStart.isBefore(earliest)) {
                continue;
            }
            LocalDateTime slotEnd = slotStart.plusMinutes(duration);

            List<User> therapists = spaBookingRepository.findAvailableTherapistsBySpecialty(specialty, slotStart, slotEnd);
            if (therapists.isEmpty()) {
                therapists = spaBookingRepository.findAvailableTherapists(slotStart, slotEnd);
            }
            if (therapists.size() < reqGuests) {
                continue;
            }

            List<TreatmentRoom> rooms = spaBookingRepository.findAvailableRoomsByCategory(specialty, slotStart, slotEnd);
            if (rooms.isEmpty()) {
                rooms = spaBookingRepository.findAvailableRooms(slotStart, slotEnd);
            }
            if (rooms.size() < reqGuests) {
                continue;
            }

            User therapist = therapists.get(0);
            TreatmentRoom room = rooms.get(0);
            String label = String.format("%02d:%02d", slotStart.getHour(), slotStart.getMinute());
            
            TimeSlotDTO slotDto = new TimeSlotDTO(slotStart, slotEnd, label,
                    therapist.getUserId(), therapist.getFullName(),
                    room.getTreatmentRoomId(), room.getRoomName());

            List<Integer> therapistIds = new ArrayList<>();
            List<String> therapistNames = new ArrayList<>();
            List<Integer> roomIds = new ArrayList<>();
            List<String> roomNames = new ArrayList<>();

            for (int i = 0; i < reqGuests; i++) {
                User t = therapists.get(i);
                TreatmentRoom r = rooms.get(i);
                therapistIds.add(t.getUserId());
                therapistNames.add(t.getFullName());
                roomIds.add(r.getTreatmentRoomId());
                roomNames.add(r.getRoomName());
            }

            slotDto.setTherapistIds(therapistIds);
            slotDto.setTherapistNames(therapistNames);
            slotDto.setTreatmentRoomIds(roomIds);
            slotDto.setRoomNames(roomNames);

            slots.add(slotDto);
        }

        return slots;
    }

    @Override
    @Transactional
    public SpaBookingResponseDTO scheduleSpaBooking(Integer userId, SpaBookingRequestDTO request, String currentUserRole) {
        User guest = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("SPA-002", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y khÃ¡ch hÃ ng."));

        SpaService service = spaServiceRepository.findById(request.getSpaServiceId())
                .orElseThrow(() -> new BusinessException("SPA-003", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y dá»‹ch vá»¥ Spa."));

        // BR-07 (Health Profile Requirement): Guest must sign the medical consent first
        MedicalProfile profile = medicalProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        "KhÃ¡ch hÃ ng báº¯t buá»™c pháº£i hoÃ n thÃ nh há»“ sÆ¡ sá»©c khá»e vÃ  cam káº¿t Ä‘iá»u khoáº£n trÆ°á»›c khi Ä‘áº·t lá»‹ch trá»‹ liá»‡u."));
        if (profile.getExplicitConsentSigned() == null || !profile.getExplicitConsentSigned()) {
            throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                    "KhÃ¡ch hÃ ng báº¯t buá»™c pháº£i Ä‘á»“ng Ã½ kÃ½ cam káº¿t há»“ sÆ¡ sá»©c khá»e trÆ°á»›c khi Ä‘áº·t lá»‹ch trá»‹ liá»‡u.");
        }

        LocalDateTime start = request.getStartDatetime();
        LocalDateTime end = start.plusMinutes(service.getDurationMinutes());

        // Concurrency Guard: Resolve therapist and room with database pessimistic locks
        Integer therapistId = request.getTherapistId();
        Integer roomId = request.getTreatmentRoomId();

        if (therapistId == null || roomId == null) {
            AutoMatchResponseDTO matches = autoMatch(request.getSpaServiceId(), start);
            therapistId = matches.getTherapistId();
            roomId = matches.getTreatmentRoomId();
        }

        User therapist = userRepository.findByIdForUpdate(therapistId)
                .orElseThrow(() -> new BusinessException("SPA-004", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y chuyÃªn gia trá»‹ liá»‡u chá»‰ Ä‘á»‹nh."));
        
        TreatmentRoom room = treatmentRoomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new BusinessException("SPA-005", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y phÃ²ng trá»‹ liá»‡u chá»‰ Ä‘á»‹nh."));

        // BR-08 & BR-09 Availability verification
        long therapistOverlaps = spaBookingRepository.countOverlappingTherapistBookings(therapist.getUserId(), start, end);
        if (therapistOverlaps > 0) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, 
                    String.format("ChuyÃªn gia %s Ä‘Ã£ cÃ³ lá»‹ch háº¹n khÃ¡c trÃ¹ng vÃ o khung giá» nÃ y.", therapist.getFullName()));
        }

        long roomOverlaps = spaBookingRepository.countOverlappingRoomBookings(room.getTreatmentRoomId(), start, end);
        if (roomOverlaps > 0) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, 
                    String.format("PhÃ²ng %s Ä‘Ã£ cÃ³ lá»‹ch háº¹n khÃ¡c trÃ¹ng vÃ o khung giá» nÃ y.", room.getRoomName()));
        }

        SpaBooking booking = new SpaBooking();
        booking.setUser(guest);
        booking.setSpaService(service);
        booking.setTherapist(therapist);
        booking.setTreatmentRoom(room);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        booking.setStatus("CONFIRMED");

        // Package vs Extra charge rules (UC11 vs UC15)
        if (request.getIsPackageIncluded() != null && request.getIsPackageIncluded()) {
            if (request.getRoomBookingId() == null) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Ä áº·t lá»‹ch theo gÃ³i yÃªu cáº§u pháº£i cung cáº¥p mÃ£ Ä‘áº·t phÃ²ng lÆ°u trÃº.");
            }
            RoomBooking roomBooking = roomBookingRepository.findById(request.getRoomBookingId())
                    .orElseThrow(() -> new BusinessException("SPA-006", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin phÃ²ng Ä‘Ã£ Ä‘áº·t."));

            if (!roomBooking.getUser().getUserId().equals(userId)) {
                throw new BusinessException("SPA-403", HttpStatus.FORBIDDEN, "MÃ£ Ä‘áº·t phÃ²ng khÃ´ng thuá»™c vá»  khÃ¡ch hÃ ng nÃ y.");
            }

            // Room booking must be active or confirmed (future booking)
            String rbStatus = roomBooking.getStatus();
            if (!"CONFIRMED".equalsIgnoreCase(rbStatus) && !"CHECKED_IN".equalsIgnoreCase(rbStatus)) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        "Đơn đặt phòng không hợp lệ, đã bị hủy hoặc đã kết thúc.");
            }

            // BR-30: Session time must fall within stay hours (Check-in from 14:00 on check-in day to 12:00 check-out day)
            java.time.LocalDateTime checkInLimit = roomBooking.getCheckInDate().toLocalDate().atTime(14, 0);
            java.time.LocalDateTime checkOutLimit = roomBooking.getCheckOutDate().toLocalDate().atTime(12, 0);

            if (start.isBefore(checkInLimit) || end.isAfter(checkOutLimit)) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        String.format("Thời gian trị liệu phải nằm trong thời gian lưu trú tại resort (từ 14:00 ngày %s đến 12:00 ngày %s).", 
                                roomBooking.getCheckInDate().toLocalDate(), roomBooking.getCheckOutDate().toLocalDate()));
            }

            RetreatPackage retreatPackage = roomBooking.getRetreatPackage();
            if (retreatPackage == null) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Äáº·t phÃ²ng nÃ y khÃ´ng Ä‘i kÃ¨m gÃ³i trá»‹ liá»‡u. Vui lÃ²ng Ä‘áº·t ngoÃ i gÃ³i.");
            }

            // Enforce package sessions limit
            int limit = getSpaSessionLimit(retreatPackage.getPackageId());
            long booked = spaBookingRepository.countPackageSessionsBooked(roomBooking.getBookingId());
            if (booked >= limit) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        String.format("GÃ³i '%s' cá»§a báº¡n chá»‰ bao gá»“m tá»‘i Ä‘a %d buá»•i Spa miá»…n phÃ­. Báº¡n Ä‘Ã£ sá»­ dá»¥ng háº¿t sá»‘ lÆ°á»£ng quy Ä‘á»‹nh.", 
                                retreatPackage.getName(), limit));
            }

            booking.setRoomBooking(roomBooking);
            booking.setIsPackageIncluded(true);
            booking.setPriceAtBooking(BigDecimal.ZERO);
        } else {
            // Extra spa service booking (UC15)
            booking.setIsPackageIncluded(false);
            booking.setPriceAtBooking(request.getPrice() != null ? request.getPrice() : service.getPrice());

            // BR: Khach hang phai co dat phong luu tru tai resort moi duoc dat dich vu spa.
            if (request.getRoomBookingId() == null) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST,
                        "Ban can co dat phong luu tru tai resort truoc khi dat dich vu spa.");
            }
            RoomBooking roomBooking = roomBookingRepository.findById(request.getRoomBookingId())
                    .orElseThrow(() -> new BusinessException("SPA-006", HttpStatus.NOT_FOUND,
                            "Khong tim thay thong tin phong da dat."));

            // Dat phong phai thuoc ve khach hang dang dat spa.
            if (roomBooking.getUser() == null || !roomBooking.getUser().getUserId().equals(userId)) {
                throw new BusinessException("SPA-403", HttpStatus.FORBIDDEN,
                        "Ma dat phong khong thuoc ve khach hang nay.");
            }

            // Dat phong phai o trang thai dang hoat dong hoac sap den (CONFIRMED hoặc CHECKED_IN)
            String rbStatus = roomBooking.getStatus();
            if (!"CONFIRMED".equalsIgnoreCase(rbStatus) && !"CHECKED_IN".equalsIgnoreCase(rbStatus)) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST,
                        "Đơn đặt phòng không hợp lệ, đã bị hủy hoặc đã kết thúc.");
            }

            // BR-30: Thoi gian tri lieu phai nam trong thoi gian cu tru (tu 14:00 ngay check-in den 12:00 ngay check-out).
            java.time.LocalDateTime checkInLimit = roomBooking.getCheckInDate().toLocalDate().atTime(14, 0);
            java.time.LocalDateTime checkOutLimit = roomBooking.getCheckOutDate().toLocalDate().atTime(12, 0);

            if (start.isBefore(checkInLimit) || end.isAfter(checkOutLimit)) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST,
                        String.format("Thời gian trị liệu phải nằm trong thời gian lưu trú tại resort (từ 14:00 ngày %s đến 12:00 ngày %s).",
                                roomBooking.getCheckInDate().toLocalDate(), roomBooking.getCheckOutDate().toLocalDate()));
            }

            booking.setRoomBooking(roomBooking);
        }

        SpaBooking savedBooking = spaBookingRepository.save(booking);

        // Recalculate invoice ledger automatically for Ã  la carte extra charges
        if (!savedBooking.getIsPackageIncluded() && savedBooking.getRoomBooking() != null) {
            try {
                invoiceService.createInvoice(savedBooking.getRoomBooking().getBookingId());
            } catch (Exception e) {
                log.error("Failed to automatically update invoice subtotal for extra spa charge: {}", e.getMessage());
            }
        }

        // Asynchronous Integrations: Google Calendar and SendGrid reminder email triggers
        CompletableFuture.runAsync(() -> {
            try {
                // Approach A: create ONE event on the shared resort calendar with guest + therapist as attendees
                String gcalEventId = googleCalendarService.createCalendarEvent(savedBooking);
                if (gcalEventId != null) {
                    spaBookingRepository.updateGoogleEventId(savedBooking.getSpaBookingId(), gcalEventId);
                }
            } catch (Exception ex) {
                log.error("[Google Calendar Integration Error] {}", ex.getMessage());
            }
            try {
                log.info("[EMAIL] Triggering instant booking confirmation email to: {}", guest.getEmail());
                emailService.sendSpaBookingConfirmationEmail(
                        guest.getEmail(),
                        guest.getFullName(),
                        service.getName(),
                        savedBooking.getStartDatetime(),
                        therapist.getFullName(),
                        room.getRoomName(),
                        savedBooking.getIsPackageIncluded(),
                        savedBooking.getPriceAtBooking()
                );
            } catch (Exception ex) {
                log.error("[Email Booking Confirmation Error] {}", ex.getMessage());
            }
        });

        return toResponseDTO(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistSpaAppointmentDTO> getTherapistSchedule(Integer therapistId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<SpaBooking> bookings = spaBookingRepository.findTherapistSchedule(therapistId, start, end);

        return bookings.stream().map(sb -> {
            SpecialistSpaAppointmentDTO dto = new SpecialistSpaAppointmentDTO();
            dto.setSpaBookingId(sb.getSpaBookingId());
            dto.setGuestId(sb.getUser().getUserId());
            dto.setGuestName(sb.getUser().getFullName());
            dto.setServiceName(sb.getSpaService().getName());
            dto.setStartDatetime(sb.getStartDatetime());
            dto.setEndDatetime(sb.getEndDatetime());
            dto.setStatus(sb.getStatus());
            dto.setTreatmentRoomName(sb.getTreatmentRoom().getRoomName());
            dto.setTherapistName(sb.getTherapist().getFullName());

            // GDPR / Decree 13/2023/ND-CP compliance: Data minimization
            // Load physical medical records but strip out kitchen allergies or bank accounts
            Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUserUserId(sb.getUser().getUserId());
            if (profileOpt.isPresent()) {
                MedicalProfile profile = profileOpt.get();
                // Expose ONLY physical condition (e.g. spine injuries, spine displacement)
                dto.setNote(profile.getPhysicalConditionEncrypted());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistSpaAppointmentDTO> getTherapistScheduleRange(Integer therapistId, LocalDate start, LocalDate end) {
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.plusDays(1).atStartOfDay();

        List<SpaBooking> bookings = spaBookingRepository.findTherapistSchedule(therapistId, startDt, endDt);

        return bookings.stream().map(sb -> {
            SpecialistSpaAppointmentDTO dto = new SpecialistSpaAppointmentDTO();
            dto.setSpaBookingId(sb.getSpaBookingId());
            dto.setGuestId(sb.getUser().getUserId());
            dto.setGuestName(sb.getUser().getFullName());
            dto.setServiceName(sb.getSpaService().getName());
            dto.setStartDatetime(sb.getStartDatetime());
            dto.setEndDatetime(sb.getEndDatetime());
            dto.setStatus(sb.getStatus());
            dto.setTreatmentRoomName(sb.getTreatmentRoom() != null ? sb.getTreatmentRoom().getRoomName() : "N/A");
            dto.setTherapistName(sb.getTherapist().getFullName());

            Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUserUserId(sb.getUser().getUserId());
            if (profileOpt.isPresent()) {
                MedicalProfile profile = profileOpt.get();
                dto.setNote(profile.getPhysicalConditionEncrypted());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SpaBookingResponseDTO updateSessionStatus(Integer spaBookingId, String status, Integer therapistId) {
        SpaBooking booking = spaBookingRepository.findById(spaBookingId)
                .orElseThrow(() -> new BusinessException("SPA-007", HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y buá»•i trá»‹ liá»‡u chá»‰ Ä‘á»‹nh."));

        if (!booking.getTherapist().getUserId().equals(therapistId)) {
            throw new BusinessException("SPA-403", HttpStatus.FORBIDDEN, "Báº¡n khÃ´ng cÃ³ quyá» n cáº­p nháº­t tráº¡ng thÃ¡i lá»‹ch háº¹n cá»§a ká»¹ thuáº­t viÃªn khÃ¡c.");
        }

        String normalizedStatus = status != null ? status.toUpperCase() : "";
        if ("IN_PROGRESS".equals(normalizedStatus) || "IN PROGRESS".equals(normalizedStatus)) {
            booking.setStatus("IN_PROGRESS");
            if (booking.getTreatmentRoom() != null) {
                booking.getTreatmentRoom().setStatus("OCCUPIED");
            }
        } else if ("COMPLETED".equals(normalizedStatus)) {
            booking.setStatus("COMPLETED");
            if (booking.getTreatmentRoom() != null) {
                booking.getTreatmentRoom().setStatus("AVAILABLE");
            }
        } else if ("CANCELLED".equals(normalizedStatus)) {
            booking.setStatus("CANCELLED");
            if (booking.getTreatmentRoom() != null) {
                booking.getTreatmentRoom().setStatus("AVAILABLE");
            }
        } else if ("NOSHOW".equals(normalizedStatus) || "NO_SHOW".equals(normalizedStatus)) {
            booking.setStatus("NO_SHOW");
            if (booking.getTreatmentRoom() != null) {
                booking.getTreatmentRoom().setStatus("AVAILABLE");
            }
        } else if ("CONFIRMED".equals(normalizedStatus)) {
            booking.setStatus("CONFIRMED");
            if (booking.getTreatmentRoom() != null) {
                booking.getTreatmentRoom().setStatus("AVAILABLE");
            }
        } else {
            throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Tráº¡ng thÃ¡i buá»•i trá»‹ liá»‡u khÃ´ng há»£p lá»‡: " + status);
        }

        SpaBooking savedBooking = spaBookingRepository.save(booking);
        if (booking.getTreatmentRoom() != null) {
            treatmentRoomRepository.save(booking.getTreatmentRoom());
        }

        // Async Google Calendar sync update
        CompletableFuture.runAsync(() -> {
            try {
                String st = savedBooking.getStatus();
                if ("CANCELLED".equalsIgnoreCase(st) || "NO_SHOW".equalsIgnoreCase(st)) {
                    googleCalendarService.deleteCalendarEvent(savedBooking);
                } else {
                    googleCalendarService.updateCalendarEvent(savedBooking);
                }
            } catch (Exception ex) {
                log.error("[Google Calendar Status Sync Error] {}", ex.getMessage());
            }
        });

        // Update invoice ledger if an extra service status was changed (e.g. cancelled/completed)
        if (!savedBooking.getIsPackageIncluded() && savedBooking.getRoomBooking() != null) {
            try {
                invoiceService.createInvoice(savedBooking.getRoomBooking().getBookingId());
            } catch (Exception e) {
                log.error("Failed to automatically update invoice subtotal on status change: {}", e.getMessage());
            }
        }

        return toResponseDTO(savedBooking);
    }

    /**
     * Maps a spa-service category to a specialist discipline / room category.
     * Categories used in seed data: SPA, YOGA, THERAPY (physiotherapy), PHYSIO.
     */
    private String normalizeSpecialty(String category) {
        if (category == null) return null;
        String c = category.trim().toUpperCase();
        switch (c) {
            case "YOGA":
                return "YOGA";
            case "PHYSIO":
            case "THERAPY":
            case "PHYSIOTHERAPY":
                return "PHYSIO";
            case "SPA":
            case "BODY":
            case "FACE":
                return "SPA";
            default:
                return c;
        }
    }
    @Override
    @Transactional
    public SpaBookingResponseDTO cancelSpaBooking(Integer spaBookingId, String reason) {
        SpaBooking booking = spaBookingRepository.findById(spaBookingId)
                .orElseThrow(() -> new BusinessException("SPA-007", HttpStatus.NOT_FOUND, "Không tìm thấy lịch spa yêu cầu."));

        if (!"PENDING".equalsIgnoreCase(booking.getStatus()) && !"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new BusinessException("SPA-400", HttpStatus.CONFLICT, "Không thể hủy lịch spa ở trạng thái hiện tại: " + booking.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = booking.getStartDatetime();
        long diffHours = java.time.Duration.between(now, start).toHours();
        
        BigDecimal refundAmt = BigDecimal.ZERO;
        BigDecimal originalPrice = booking.getPriceAtBooking() != null ? booking.getPriceAtBooking() : BigDecimal.ZERO;

        if (diffHours >= 2) {
            refundAmt = originalPrice; // 100% refund
        } else {
            refundAmt = originalPrice.multiply(new BigDecimal("0.50")).setScale(2, java.math.RoundingMode.HALF_UP); // 50% refund
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(reason);
        booking.setCancellationTime(now);
        booking.setRefundAmount(refundAmt);

        if (booking.getTreatmentRoom() != null) {
            booking.getTreatmentRoom().setStatus("AVAILABLE");
            treatmentRoomRepository.save(booking.getTreatmentRoom());
        }

        SpaBooking savedBooking = spaBookingRepository.save(booking);

        // Async Google Calendar sync update
        CompletableFuture.runAsync(() -> {
            try {
                googleCalendarService.syncBookingToCalendar(savedBooking.getUser(), savedBooking);
                googleCalendarService.syncBookingToCalendar(savedBooking.getTherapist(), savedBooking);
            } catch (Exception ex) {
                log.error("[Google Calendar Status Sync Error on Cancel] {}", ex.getMessage());
            }
        });

        // Update invoice ledger if an extra service status was changed (e.g. cancelled/completed)
        if (!savedBooking.getIsPackageIncluded() && savedBooking.getRoomBooking() != null) {
            try {
                invoiceService.createInvoice(savedBooking.getRoomBooking().getBookingId());
            } catch (Exception e) {
                log.error("Failed to automatically update invoice subtotal on cancel: {}", e.getMessage());
            }
        }

        return toResponseDTO(savedBooking);
    }

    private int getSpaSessionLimit(Integer packageId) {
        if (packageId == null) return 0;
        switch (packageId) {
            case 1: return 3; // 5-day Detox Journey: 3 sessions
            case 2: return 2; // Mindfulness & Yoga Weekend: 2 sessions
            case 3: return 3; // Weight Loss & Slimming: 3 sessions
            case 4: return 2; // Deep Stress Relief: 2 sessions
            case 5: return 5; // Spine Recovery: 5 sessions
            default: return 1;
        }
    }

    private SpaBookingResponseDTO toResponseDTO(SpaBooking sb) {
        SpaBookingResponseDTO dto = new SpaBookingResponseDTO();
        dto.setSpaBookingId(sb.getSpaBookingId());
        dto.setGuestId(sb.getUser().getUserId());
        dto.setGuestName(sb.getUser().getFullName());
        dto.setSpaServiceId(sb.getSpaService().getServiceId());
        dto.setServiceName(sb.getSpaService().getName());
        dto.setTherapistId(sb.getTherapist().getUserId());
        dto.setTherapistName(sb.getTherapist().getFullName());
        dto.setTreatmentRoomId(sb.getTreatmentRoom().getTreatmentRoomId());
        dto.setRoomName(sb.getTreatmentRoom().getRoomName());
        dto.setStartDatetime(sb.getStartDatetime());
        dto.setEndDatetime(sb.getEndDatetime());
        dto.setStatus(sb.getStatus());
        dto.setPriceAtBooking(sb.getPriceAtBooking());
        dto.setIsPackageIncluded(sb.getIsPackageIncluded());
        return dto;
    }
}
