package fu.se.smms.service.impl;

import fu.se.smms.dto.*;
import fu.se.smms.entity.*;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.*;
import fu.se.smms.service.SpaBookingService;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Override
    @Transactional(readOnly = true)
    public AutoMatchResponseDTO autoMatch(Integer spaServiceId, LocalDateTime startDatetime) {
        SpaService service = spaServiceRepository.findById(spaServiceId)
                .orElseThrow(() -> new BusinessException("SPA-001", HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ Spa."));

        LocalDateTime endDatetime = startDatetime.plusMinutes(service.getDurationMinutes());

        List<User> availableTherapists = spaBookingRepository.findAvailableTherapists(startDatetime, endDatetime);
        List<TreatmentRoom> availableRooms = spaBookingRepository.findAvailableRooms(startDatetime, endDatetime);

        if (availableTherapists.isEmpty()) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, "Không có chuyên gia trị liệu nào trống trong khung giờ này.");
        }
        if (availableRooms.isEmpty()) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, "Không có phòng trị liệu nào trống trong khung giờ này.");
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
    @Transactional
    public SpaBookingResponseDTO scheduleSpaBooking(Integer userId, SpaBookingRequestDTO request, String currentUserRole) {
        User guest = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("SPA-002", HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng."));

        SpaService service = spaServiceRepository.findById(request.getSpaServiceId())
                .orElseThrow(() -> new BusinessException("SPA-003", HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ Spa."));

        // BR-07 (Health Profile Requirement): Guest must sign the medical consent first
        MedicalProfile profile = medicalProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        "Khách hàng bắt buộc phải hoàn thành hồ sơ sức khỏe và cam kết điều khoản trước khi đặt lịch trị liệu."));
        if (profile.getExplicitConsentSigned() == null || !profile.getExplicitConsentSigned()) {
            throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                    "Khách hàng bắt buộc phải đồng ý ký cam kết hồ sơ sức khỏe trước khi đặt lịch trị liệu.");
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
                .orElseThrow(() -> new BusinessException("SPA-004", HttpStatus.NOT_FOUND, "Không tìm thấy chuyên gia trị liệu chỉ định."));
        
        TreatmentRoom room = treatmentRoomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new BusinessException("SPA-005", HttpStatus.NOT_FOUND, "Không tìm thấy phòng trị liệu chỉ định."));

        // BR-08 & BR-09 Availability verification
        long therapistOverlaps = spaBookingRepository.countOverlappingTherapistBookings(therapist.getUserId(), start, end);
        if (therapistOverlaps > 0) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, 
                    String.format("Chuyên gia %s đã có lịch hẹn khác trùng vào khung giờ này.", therapist.getFullName()));
        }

        long roomOverlaps = spaBookingRepository.countOverlappingRoomBookings(room.getTreatmentRoomId(), start, end);
        if (roomOverlaps > 0) {
            throw new BusinessException("SPA-409", HttpStatus.CONFLICT, 
                    String.format("Phòng %s đã có lịch hẹn khác trùng vào khung giờ này.", room.getRoomName()));
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
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Đặt lịch theo gói yêu cầu phải cung cấp mã đặt phòng lưu trú.");
            }
            RoomBooking roomBooking = roomBookingRepository.findById(request.getRoomBookingId())
                    .orElseThrow(() -> new BusinessException("SPA-006", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin phòng đã đặt."));

            if (!roomBooking.getUser().getUserId().equals(userId)) {
                throw new BusinessException("SPA-403", HttpStatus.FORBIDDEN, "Mã đặt phòng không thuộc về khách hàng này.");
            }

            // BR-30: Session time must fall within the stay check-in/check-out dates
            if (start.isBefore(roomBooking.getCheckInDate()) || end.isAfter(roomBooking.getCheckOutDate())) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        String.format("Thời gian trị liệu phải nằm trong khoảng lưu trú (%s - %s).", 
                                roomBooking.getCheckInDate(), roomBooking.getCheckOutDate()));
            }

            RetreatPackage retreatPackage = roomBooking.getRetreatPackage();
            if (retreatPackage == null) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Đặt phòng này không đi kèm gói trị liệu. Vui lòng đặt ngoài gói.");
            }

            // Enforce package sessions limit
            int limit = getSpaSessionLimit(retreatPackage.getPackageId());
            long booked = spaBookingRepository.countPackageSessionsBooked(roomBooking.getBookingId());
            if (booked >= limit) {
                throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, 
                        String.format("Gói '%s' của bạn chỉ bao gồm tối đa %d buổi Spa miễn phí. Bạn đã sử dụng hết số lượng quy định.", 
                                retreatPackage.getName(), limit));
            }

            booking.setRoomBooking(roomBooking);
            booking.setIsPackageIncluded(true);
            booking.setPriceAtBooking(BigDecimal.ZERO);
        } else {
            // Extra spa service booking (UC15)
            booking.setIsPackageIncluded(false);
            booking.setPriceAtBooking(request.getPrice() != null ? request.getPrice() : service.getPrice());

            if (request.getRoomBookingId() != null) {
                RoomBooking roomBooking = roomBookingRepository.findById(request.getRoomBookingId())
                        .orElseThrow(() -> new BusinessException("SPA-006", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin phòng đã đặt."));
                booking.setRoomBooking(roomBooking);
            }
        }

        SpaBooking savedBooking = spaBookingRepository.save(booking);

        // Recalculate invoice ledger automatically for à la carte extra charges
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
                log.info("[MOCK GOOGLE CALENDAR API] Synchronizing spa session ID {} for guest {} on Google Calendar.", 
                        savedBooking.getSpaBookingId(), guest.getEmail());
            } catch (Exception ex) {
                log.error("[Google Calendar Integration Error] {}", ex.getMessage());
            }
            try {
                log.info("[MOCK SENDGRID EMAIL] Triggering instant booking confirmation email to: {}", guest.getEmail());
            } catch (Exception ex) {
                log.error("[SendGrid Integration Error] {}", ex.getMessage());
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
    @Transactional
    public SpaBookingResponseDTO updateSessionStatus(Integer spaBookingId, String status, Integer therapistId) {
        SpaBooking booking = spaBookingRepository.findById(spaBookingId)
                .orElseThrow(() -> new BusinessException("SPA-007", HttpStatus.NOT_FOUND, "Không tìm thấy buổi trị liệu chỉ định."));

        if (!booking.getTherapist().getUserId().equals(therapistId)) {
            throw new BusinessException("SPA-403", HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật trạng thái lịch hẹn của kỹ thuật viên khác.");
        }

        String normalizedStatus = status != null ? status.toUpperCase() : "";
        if ("IN_PROGRESS".equals(normalizedStatus) || "IN PROGRESS".equals(normalizedStatus)) {
            booking.setStatus("IN_PROGRESS");
            booking.getTreatmentRoom().setStatus("OCCUPIED");
        } else if ("COMPLETED".equals(normalizedStatus)) {
            booking.setStatus("COMPLETED");
            booking.getTreatmentRoom().setStatus("AVAILABLE");
        } else if ("CANCELLED".equals(normalizedStatus)) {
            booking.setStatus("CANCELLED");
            booking.getTreatmentRoom().setStatus("AVAILABLE");
        } else if ("NOSHOW".equals(normalizedStatus) || "NO_SHOW".equals(normalizedStatus)) {
            booking.setStatus("NO_SHOW");
            booking.getTreatmentRoom().setStatus("AVAILABLE");
        } else if ("CONFIRMED".equals(normalizedStatus)) {
            booking.setStatus("CONFIRMED");
            booking.getTreatmentRoom().setStatus("AVAILABLE");
        } else {
            throw new BusinessException("SPA-400", HttpStatus.BAD_REQUEST, "Trạng thái buổi trị liệu không hợp lệ: " + status);
        }

        SpaBooking savedBooking = spaBookingRepository.save(booking);
        treatmentRoomRepository.save(booking.getTreatmentRoom());

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
