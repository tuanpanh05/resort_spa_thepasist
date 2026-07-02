package fu.se.smms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbCheckTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void printDbInfo() {
        System.out.println("========== DB CHECK START ==========");
        try {
            System.out.println("--- INVOICES ---");
            List<Map<String, Object>> invoices = jdbcTemplate.queryForList(
                "SELECT invoice_id, user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, service_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, payment_time FROM dbo.invoice"
            );
            for (Map<String, Object> inv : invoices) {
                System.out.println(inv);
            }

            System.out.println("--- INCURRED SERVICES ---");
            List<Map<String, Object>> incurred = jdbcTemplate.queryForList(
                "SELECT id, room_booking_id, room_number, category, detail, price, status, created_at FROM dbo.incurred_services"
            );
            for (Map<String, Object> inc : incurred) {
                System.out.println(inc);
            }

            System.out.println("--- REVENUE SUMMARY ---");
            Map<String, Object> sum = jdbcTemplate.queryForMap(
                "SELECT " +
                "  COALESCE(SUM(room_subtotal), 0) as room_sub, " +
                "  COALESCE(SUM(spa_subtotal), 0) as spa_sub, " +
                "  COALESCE(SUM(food_subtotal), 0) as food_sub, " +
                "  COALESCE(SUM(service_subtotal), 0) as service_sub, " +
                "  COALESCE(SUM(tax_and_fees), 0) as tax, " +
                "  COALESCE(SUM(final_amount), 0) as final_amt " +
                "FROM dbo.invoice WHERE status = 'PAID'"
            );
            System.out.println("Paid Invoices Sums: " + sum);

            System.out.println("--- REVENUE MONTHLY SUMMARY ---");
            List<Map<String, Object>> monthly = jdbcTemplate.queryForList(
                "SELECT MONTH(payment_time) as month_num, " +
                "  SUM(room_subtotal) as room_rev, " +
                "  SUM(spa_subtotal) as spa_rev, " +
                "  SUM(food_subtotal) as food_rev, " +
                "  SUM(service_subtotal) as service_rev " +
                "FROM dbo.invoice WHERE status = 'PAID' GROUP BY MONTH(payment_time)"
            );
            for (Map<String, Object> mon : monthly) {
                System.out.println(mon);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("========== DB CHECK END ==========");
    }
}
