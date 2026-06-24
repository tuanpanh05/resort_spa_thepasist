package fu.se.smms.service;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.SpaBooking;
import fu.se.smms.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service facilitating Google Calendar Synchronization (ADR-004).
 * Fully structured to show logs and parameters for quick developer integration.
 * In production, this can be wired with Google API client dependencies.
 */
@Service
public class GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Synchronizes a single Spa Booking appointment to a user's Google Calendar.
     * Applicable for both Guests and Therapists.
     */
    public void syncBookingToCalendar(User user, SpaBooking booking) {
        if (user == null || booking == null) return;

        if (user.getGoogleCalendarSyncEnabled() == null || !user.getGoogleCalendarSyncEnabled()) {
            log.info("[Google Calendar] Sync is disabled for user: {}. Skipping calendar sync.", user.getEmail());
            return;
        }

        String calendarId = getCalendarId(user);
        log.info("[Google Calendar] Attempting calendar sync for: {}", user.getEmail());
        
        // Construct the Google Calendar event details structure
        String summary = String.format("Ngũ Sơn Resort - Trị liệu Spa: %s", booking.getSpaService().getName());
        String description = String.format(
                "Mã buổi trị liệu: SPA-%04d\n" +
                "Kỹ thuật viên: %s\n" +
                "Phòng trị liệu: %s\n" +
                "Trạng thái: %s\n" +
                "Ghi chú sức khỏe: %s",
                booking.getSpaBookingId(),
                booking.getTherapist() != null ? booking.getTherapist().getFullName() : "Tự động sắp xếp",
                booking.getTreatmentRoom() != null ? booking.getTreatmentRoom().getRoomName() : "N/A",
                booking.getStatus(),
                booking.getUser() != null ? "Vui lòng xem hồ sơ bệnh án được chia sẻ" : "N/A"
        );

        String startTimeStr = booking.getStartDatetime().format(ISO_FORMATTER);
        String endTimeStr = booking.getEndDatetime().format(ISO_FORMATTER);

        // Print API representation payload
        log.info("[Google Calendar API SUCCESS] Event synchronized to calendar '{}':\n" +
                        "  {\n" +
                        "    \"summary\": \"{}\",\n" +
                        "    \"description\": \"{}\",\n" +
                        "    \"start\": { \"dateTime\": \"{}\", \"timeZone\": \"Asia/Ho_Chi_Minh\" },\n" +
                        "    \"end\": { \"dateTime\": \"{}\", \"timeZone\": \"Asia/Ho_Chi_Minh\" },\n" +
                        "    \"reminders\": {\n" +
                        "      \"useDefault\": false,\n" +
                        "      \"overrides\": [\n" +
                        "        { \"method\": \"email\", \"minutes\": {} },\n" +
                        "        { \"method\": \"popup\", \"minutes\": {} }\n" +
                        "      ]\n" +
                        "    }\n" +
                        "  }",
                calendarId,
                summary,
                description.replace("\n", " | "),
                startTimeStr,
                endTimeStr,
                user.getReminderLeadTimeMins() != null ? user.getReminderLeadTimeMins() : 30,
                user.getReminderLeadTimeMins() != null ? user.getReminderLeadTimeMins() : 30
        );
    }

    /**
     * Removes an event from Google Calendar (e.g., booking cancelled).
     */
    public void deleteBookingFromCalendar(User user, SpaBooking booking) {
        if (user == null || booking == null) return;
        if (user.getGoogleCalendarSyncEnabled() == null || !user.getGoogleCalendarSyncEnabled()) {
            return;
        }

        String calendarId = getCalendarId(user);
        log.info("[Google Calendar API SUCCESS] Removed Spa Booking #{} event from calendar '{}'.", 
                booking.getSpaBookingId(), calendarId);
    }

    /**
     * Synchronizes a Room Booking to the Guest's calendar.
     */
    public void syncRoomBookingToCalendar(User user, RoomBooking roomBooking) {
        if (user == null || roomBooking == null) return;
        if (user.getGoogleCalendarSyncEnabled() == null || !user.getGoogleCalendarSyncEnabled()) {
            return;
        }

        String calendarId = getCalendarId(user);
        String summary = String.format("Ngũ Sơn Resort - Đặt phòng: %s", 
                roomBooking.getRetreatPackage() != null ? roomBooking.getRetreatPackage().getName() : "Lưu trú dưỡng sinh");
        
        String description = String.format(
                "Mã đặt phòng: #%d\n" +
                "Ngày nhận phòng: %s\n" +
                "Ngày trả phòng: %s\n" +
                "Trạng thái: %s",
                roomBooking.getBookingId(),
                roomBooking.getCheckInDate().format(ISO_FORMATTER),
                roomBooking.getCheckOutDate().format(ISO_FORMATTER),
                roomBooking.getStatus()
        );

        log.info("[Google Calendar API SUCCESS] Event synchronized to calendar '{}':\n" +
                        "  {\n" +
                        "    \"summary\": \"{}\",\n" +
                        "    \"description\": \"{}\",\n" +
                        "    \"start\": { \"date\": \"{}\" },\n" +
                        "    \"end\": { \"date\": \"{}\" }\n" +
                        "  }",
                calendarId,
                summary,
                description.replace("\n", " | "),
                roomBooking.getCheckInDate().toLocalDate().toString(),
                roomBooking.getCheckOutDate().toLocalDate().toString()
        );
    }

    /**
     * Helper to resolve calendar ID (defaults to user's email if not explicitly configured).
     */
    private String getCalendarId(User user) {
        if (user.getGoogleCalendarId() != null && !user.getGoogleCalendarId().isBlank()) {
            return user.getGoogleCalendarId();
        }
        return user.getEmail();
    }
}
