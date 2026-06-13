package fu.se.smms.repository;

import fu.se.smms.entity.PaymentTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for BR-26: Transaction Audit Trail.
 * This is append-only - no delete or update operations exposed.
 */
@Repository
public interface PaymentTransactionLogRepository extends JpaRepository<PaymentTransactionLog, Integer> {

    /** Get all transaction logs for an invoice (for audit purposes) */
    List<PaymentTransactionLog> findByInvoice_InvoiceIdOrderByTransactionTimeAsc(Integer invoiceId);

    /** Revenue analytics: sum of paid amounts grouped by payment method */
    @Query(value = """
            SELECT payment_method, SUM(amount) as total
            FROM dbo.payment_transaction_log
            WHERE status = 'PAID'
            GROUP BY payment_method
            """, nativeQuery = true)
    List<Object[]> sumRevenueByPaymentMethod();

    /** Count transactions by status for dashboard */
    @Query(value = """
            SELECT status, COUNT(*) as count
            FROM dbo.payment_transaction_log
            GROUP BY status
            """, nativeQuery = true)
    List<Object[]> countByStatus();
}
