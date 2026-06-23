package fu.se.smms.config;

import fu.se.smms.entity.SpaBooking;
import fu.se.smms.repository.SpaBookingRepository;
import fu.se.smms.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SpaReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(SpaReminderScheduler.class);

    @Autowired
    private SpaBookingRepository spaBookingRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every 5 minutes to scan for confirmed spa appointments starting in 55 to 65 minutes.
     * Enforces the 1-hour warning email reminder business rule.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void sendUpcomingSpaReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startRange = now.plusMinutes(55);
        LocalDateTime endRange = now.plusMinutes(65);

        log.info("[SpaReminderScheduler] Scanning for confirmed spa bookings starting between {} and {}...", startRange, endRange);

        try {
            List<SpaBooking> upcomingBookings = spaBookingRepository.findUpcomingConfirmedBookings(startRange, endRange);
            if (upcomingBookings != null && !upcomingBookings.isEmpty()) {
                log.info("[SpaReminderScheduler] Found {} upcoming confirmed spa bookings. Dispatching reminders...", upcomingBookings.size());
                for (SpaBooking sb : upcomingBookings) {
                    if (sb.getUser() != null && sb.getUser().getEmail() != null) {
                        try {
                            emailService.sendSpaReminderEmail(
                                sb.getUser().getEmail(),
                                sb.getUser().getFullName(),
                                sb.getSpaService().getName(),
                                sb.getStartDatetime()
                            );
                            log.info("[SpaReminderScheduler] Successfully dispatched 1-hour spa reminder email to: {}", sb.getUser().getEmail());
                        } catch (Exception ex) {
                            log.error("[SpaReminderScheduler] Error sending reminder email to {}: {}", sb.getUser().getEmail(), ex.getMessage());
                        }
                    }
                }
            } else {
                log.info("[SpaReminderScheduler] No upcoming confirmed spa bookings found starting in 1 hour.");
            }
        } catch (Exception ex) {
            log.error("[SpaReminderScheduler] Error querying upcoming spa bookings: {}", ex.getMessage());
        }
    }
}
