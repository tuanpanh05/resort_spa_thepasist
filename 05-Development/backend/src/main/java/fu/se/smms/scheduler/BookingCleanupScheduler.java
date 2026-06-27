package fu.se.smms.scheduler;

import fu.se.smms.entity.RoomBooking;
import fu.se.smms.repository.RoomBookingRepository;
import fu.se.smms.service.RoomBookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingCleanupScheduler.class);

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private RoomBookingService roomBookingService;

    @jakarta.annotation.PostConstruct
    public void initCleanup() {
        System.out.println("[Scheduler] BookingCleanupScheduler initialized. Running startup cleanup for expired PENDING_DEPOSIT bookings...");
        cleanupExpiredBookings();
    }

    // Run every minute
    @Scheduled(cron = "0 * * * * ?")
    public void cleanupExpiredBookings() {
        // Expiry threshold: 15 minutes ago (matching VNPay's expiry time)
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        
        try {
            List<RoomBooking> expiredBookings = roomBookingRepository.findByStatusAndCreatedAtBefore("PENDING_DEPOSIT", threshold);
            if (!expiredBookings.isEmpty()) {
                log.info("[Scheduler] Found {} expired PENDING_DEPOSIT bookings to clean up.", expiredBookings.size());
                for (RoomBooking booking : expiredBookings) {
                    try {
                        roomBookingService.cancelBooking(
                            booking.getBookingId(), 
                            "Hủy tự động do không thanh toán cọc trong thời gian quy định (15 phút)."
                        );
                        log.info("[Scheduler] Successfully cancelled expired bookingId={}", booking.getBookingId());
                    } catch (Exception e) {
                        log.error("[Scheduler] Failed to cancel expired bookingId={}: {}", booking.getBookingId(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("[Scheduler] Error querying expired bookings: {}", e.getMessage());
        }
    }
}
