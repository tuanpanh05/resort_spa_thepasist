package fu.se.smms.scheduler;

import fu.se.smms.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class InvoiceCleanupScheduler {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @jakarta.annotation.PostConstruct
    public void initCleanup() {
        System.out.println("[Scheduler] InvoiceCleanupScheduler initialized. Running startup cleanup...");
        cleanupOldInvoices();
    }

    // Run every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupOldInvoices() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(15);
        try {
            int deletedCount = invoiceRepository.deleteOldInvoices(threshold);
            if (deletedCount > 0) {
                System.out.println("[Scheduler] Cleaned up " + deletedCount + " checked-out invoices older than 15 days.");
            }
        } catch (Exception e) {
            System.err.println("[Scheduler] Error cleaning up old invoices: " + e.getMessage());
        }
    }
}
