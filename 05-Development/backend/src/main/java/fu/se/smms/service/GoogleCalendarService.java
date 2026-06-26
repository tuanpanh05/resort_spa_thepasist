package fu.se.smms.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventReminder;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import fu.se.smms.entity.RoomBooking;
import fu.se.smms.entity.SpaBooking;
import fu.se.smms.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Google Calendar synchronization (Module 3, Approach A: Service Account + shared resort calendar).
 *
 * Every confirmed spa/therapy session becomes ONE event on the resort's shared calendar.
 * The guest and the assigned therapist are added as attendees, so Google automatically
 * emails them an invitation and the 1-hour reminder, and staff can subscribe to the
 * shared calendar to follow the daily schedule.
 *
 * Fails gracefully: if the credential file is missing or the API errors out, every method
 * logs and returns without breaking the booking flow (it runs inside an async block anyway).
 */
@Service
public class GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final String TIME_ZONE = "Asia/Ho_Chi_Minh";
    private static final String APPLICATION_NAME = "Ngu Son Resort & Spa";

    @Value("${google.calendar.enabled:false}")
    private boolean calendarEnabled;

    @Value("${google.calendar.id:}")
    private String calendarId;

    @Value("${google.calendar.credentials-path:credentials/google-service-account.json}")
    private String credentialsPath;

    private Calendar calendarClient;
    private boolean initAttempted = false;

    private synchronized Calendar getClient() {
        if (!calendarEnabled) return null;
        if (initAttempted) return calendarClient;
        initAttempted = true;
        try {
            InputStream stream;
            if (Files.exists(Paths.get(credentialsPath))) {
                stream = new FileInputStream(credentialsPath);
            } else {
                stream = getClass().getClassLoader().getResourceAsStream(credentialsPath);
            }
            if (stream == null) {
                log.warn("[Google Calendar] Credentials file not found at '{}'. Calendar sync disabled.", credentialsPath);
                return null;
            }
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(stream)
                    .createScoped(Collections.singleton(CalendarScopes.CALENDAR));
            calendarClient = new Calendar.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(APPLICATION_NAME)
                    .build();
            log.info("[Google Calendar] Service initialized. Calendar ID: {}", calendarId);
        } catch (IOException | GeneralSecurityException e) {
            log.error("[Google Calendar] Initialization failed: {}", e.getMessage());
            calendarClient = null;
        }
        return calendarClient;
    }

    // --- Public API ---------------------------------------------------------

    /**
     * Creates one event on the shared resort calendar with guest + therapist as attendees.
     * @return the Google event ID (to persist on spa_booking), or null on failure / disabled.
     */
    public String createCalendarEvent(SpaBooking booking) {
        Calendar svc = getClient();
        if (svc == null || isBlank(calendarId)) return null;
        try {
            Event created = svc.events()
                    .insert(calendarId, buildEvent(booking))
                    .setSendUpdates("all")
                    .execute();
            log.info("[Google Calendar] Event created: id={} for SpaBooking#{}",
                    created.getId(), booking.getSpaBookingId());
            return created.getId();
        } catch (IOException e) {
            log.error("[Google Calendar] createCalendarEvent failed for SpaBooking#{}: {}",
                    booking.getSpaBookingId(), e.getMessage());
            return null;
        }
    }

    /**
     * Updates the existing event when session status changes.
     * If no event ID is recorded yet, a new event is created instead.
     */
    public void updateCalendarEvent(SpaBooking booking) {
        Calendar svc = getClient();
        if (svc == null || isBlank(calendarId)) return;
        String eventId = booking.getGoogleCalendarEventId();
        if (isBlank(eventId)) {
            createCalendarEvent(booking);
            return;
        }
        try {
            svc.events()
                    .update(calendarId, eventId, buildEvent(booking))
                    .setSendUpdates("all")
                    .execute();
            log.info("[Google Calendar] Event updated: id={} status={}", eventId, booking.getStatus());
        } catch (IOException e) {
            log.error("[Google Calendar] updateCalendarEvent failed (id={}): {}", eventId, e.getMessage());
        }
    }

    /**
     * Removes the event when a booking is cancelled or marked no-show.
     */
    public void deleteCalendarEvent(SpaBooking booking) {
        Calendar svc = getClient();
        if (svc == null || isBlank(calendarId)) return;
        String eventId = booking.getGoogleCalendarEventId();
        if (isBlank(eventId)) return;
        try {
            svc.events().delete(calendarId, eventId).setSendUpdates("all").execute();
            log.info("[Google Calendar] Event deleted: id={}", eventId);
        } catch (IOException e) {
            log.error("[Google Calendar] deleteCalendarEvent failed (id={}): {}", eventId, e.getMessage());
        }
    }

    // --- Legacy stubs kept for UserController compatibility -----------------

    public void syncBookingToCalendar(User user, SpaBooking booking) {
        if (booking == null) return;
        if (isBlank(booking.getGoogleCalendarEventId())) createCalendarEvent(booking);
    }

    public void deleteBookingFromCalendar(User user, SpaBooking booking) {
        deleteCalendarEvent(booking);
    }

    public void syncRoomBookingToCalendar(User user, RoomBooking roomBooking) {
        log.debug("[Google Calendar] Room booking sync skipped (spa-only calendar).");
    }

    // --- Helpers ------------------------------------------------------------

    private Event buildEvent(SpaBooking booking) {
        String statusLabel = translateStatus(booking.getStatus());
        String summary = String.format("Ngu Son Resort - %s [%s]",
                booking.getSpaService().getName(), statusLabel);
        String description = String.format(
                "Ma buoi: SPA-%04d%nKy thuat vien: %s%nPhong tri lieu: %s%nTrang thai: %s%nLoai: %s",
                booking.getSpaBookingId(),
                booking.getTherapist() != null ? booking.getTherapist().getFullName() : "Chua phan cong",
                booking.getTreatmentRoom() != null ? booking.getTreatmentRoom().getRoomName() : "N/A",
                statusLabel,
                Boolean.TRUE.equals(booking.getIsPackageIncluded()) ? "Trong goi luu tru" : "Dat them ngoai goi");

        Event event = new Event()
                .setSummary(summary)
                .setDescription(description)
                .setColorId(statusColorId(booking.getStatus()));

        event.setStart(new EventDateTime()
                .setDateTime(toGoogleDt(booking.getStartDatetime()))
                .setTimeZone(TIME_ZONE));
        event.setEnd(new EventDateTime()
                .setDateTime(toGoogleDt(booking.getEndDatetime()))
                .setTimeZone(TIME_ZONE));

        List<EventAttendee> attendees = new ArrayList<>();
        if (booking.getUser() != null && !isBlank(booking.getUser().getEmail())) {
            attendees.add(new EventAttendee()
                    .setEmail(booking.getUser().getEmail())
                    .setDisplayName(booking.getUser().getFullName())
                    .setResponseStatus("accepted"));
        }
        if (booking.getTherapist() != null && !isBlank(booking.getTherapist().getEmail())) {
            attendees.add(new EventAttendee()
                    .setEmail(booking.getTherapist().getEmail())
                    .setDisplayName(booking.getTherapist().getFullName())
                    .setResponseStatus("accepted"));
        }
        if (!attendees.isEmpty()) event.setAttendees(attendees);

        event.setReminders(new Event.Reminders()
                .setUseDefault(false)
                .setOverrides(Arrays.asList(
                        new EventReminder().setMethod("email").setMinutes(60),
                        new EventReminder().setMethod("popup").setMinutes(30))));
        return event;
    }

    private com.google.api.client.util.DateTime toGoogleDt(LocalDateTime ldt) {
        ZonedDateTime zdt = ldt.atZone(ZoneId.of(TIME_ZONE));
        return new com.google.api.client.util.DateTime(Date.from(zdt.toInstant()));
    }

    private String translateStatus(String s) {
        if (s == null) return "Da xac nhan";
        switch (s.toUpperCase()) {
            case "CONFIRMED":   return "Da xac nhan";
            case "IN_PROGRESS": return "Dang tien hanh";
            case "COMPLETED":   return "Da hoan thanh";
            case "CANCELLED":   return "Da huy";
            case "NO_SHOW":     return "Khach khong den";
            default:            return s;
        }
    }

    private String statusColorId(String s) {
        if (s == null) return "2";
        switch (s.toUpperCase()) {
            case "CONFIRMED":   return "2";   // sage green
            case "IN_PROGRESS": return "5";   // banana yellow
            case "COMPLETED":   return "8";   // graphite
            case "CANCELLED":
            case "NO_SHOW":     return "11";  // tomato red
            default:            return "2";
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}