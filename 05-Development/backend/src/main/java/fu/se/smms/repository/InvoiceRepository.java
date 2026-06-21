package fu.se.smms.repository;

import fu.se.smms.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByUser_UserId(Integer userId);
    List<Invoice> findByRoomBooking_BookingId(Integer bookingId);
    Optional<Invoice> findFirstByRoomBooking_BookingId(Integer bookingId);

    // ─── Aggregation queries for recalculate() ──────────────────────────────

    @Query(value = """
            SELECT COALESCE(
                (SELECT SUM(p.price)
                 FROM dbo.booking_packages bp
                 INNER JOIN dbo.retreat_packages p ON p.package_id = bp.package_id
                 WHERE bp.booking_id = b.booking_id),
                0
            ) + COALESCE(room_charge.room_subtotal, 0)
            FROM dbo.room_booking b
            OUTER APPLY (
                SELECT SUM(d.price_at_booking) * DATEDIFF(day, b.check_in_date, b.check_out_date) AS room_subtotal
                FROM dbo.room_booking_detail d
                WHERE d.booking_id = b.booking_id
            ) room_charge
            WHERE b.booking_id = :bookingId
            """, nativeQuery = true)
    BigDecimal sumRoomSubtotal(@Param("bookingId") Integer bookingId);

    @Query(value = """
            SELECT COALESCE(SUM(price_at_booking), 0)
            FROM dbo.spa_booking
            WHERE room_booking_id = :bookingId
              AND is_package_included = 0
              AND status IN ('CONFIRMED', 'COMPLETED')
            """, nativeQuery = true)
    BigDecimal sumSpaSubtotal(@Param("bookingId") Integer bookingId);

    @Query(value = """
            SELECT COALESCE(SUM(d.quantity * d.price_at_order), 0)
            FROM dbo.food_order_detail d
            INNER JOIN dbo.food_order o ON o.order_id = d.order_id
            WHERE o.room_booking_id = :bookingId
              AND d.is_package_included = 0
              AND o.status IN ('READY', 'DELIVERED')
            """, nativeQuery = true)
    BigDecimal sumFoodSubtotal(@Param("bookingId") Integer bookingId);

    // ─── Checkout lock guard - BR-15: block checkout if pending orders exist ──

    /**
     * Returns count of spa_bookings that are NOT completed/cancelled/noshow for this booking.
     * If count > 0, receptionist cannot proceed with checkout.
     */
    @Query(value = """
            SELECT COUNT(*)
            FROM dbo.spa_booking
            WHERE room_booking_id = :bookingId
              AND status IN ('PENDING', 'CONFIRMED')
            """, nativeQuery = true)
    Long countPendingSpaSessions(@Param("bookingId") Integer bookingId);

    /**
     * Returns count of food_orders that are NOT in terminal states for this booking.
     * If count > 0, receptionist cannot proceed with checkout.
     */
    @Query(value = """
            SELECT COUNT(*)
            FROM dbo.food_order
            WHERE room_booking_id = :bookingId
              AND status IN ('PENDING', 'PREPARING')
            """, nativeQuery = true)
    Long countPendingFoodOrders(@Param("bookingId") Integer bookingId);

    // ─── UC24: Revenue Dashboard Queries (BR-27) ─────────────────────────────

    /**
     * Sum of room subtotals from PAID invoices in a given year (optionally filtered by month).
     */
    @Query(value = """
            SELECT COALESCE(SUM(i.room_subtotal), 0)
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
              AND (:month IS NULL OR MONTH(i.payment_time) = :month)
            """, nativeQuery = true)
    BigDecimal sumRoomRevenueByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    @Query(value = """
            SELECT COALESCE(SUM(i.spa_subtotal), 0)
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
              AND (:month IS NULL OR MONTH(i.payment_time) = :month)
            """, nativeQuery = true)
    BigDecimal sumSpaRevenueByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    @Query(value = """
            SELECT COALESCE(SUM(i.food_subtotal), 0)
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
              AND (:month IS NULL OR MONTH(i.payment_time) = :month)
            """, nativeQuery = true)
    BigDecimal sumFoodRevenueByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    @Query(value = """
            SELECT COALESCE(SUM(i.tax_and_fees), 0)
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
              AND (:month IS NULL OR MONTH(i.payment_time) = :month)
            """, nativeQuery = true)
    BigDecimal sumTaxRevenueByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    /** Count PAID invoices in period */
    @Query(value = """
            SELECT COUNT(*)
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
              AND (:month IS NULL OR MONTH(i.payment_time) = :month)
            """, nativeQuery = true)
    Long countPaidInvoicesByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    /** Count CHECKED_OUT bookings in period */
    @Query(value = """
            SELECT COUNT(*)
            FROM dbo.room_booking rb
            WHERE rb.status = 'CHECKED_OUT'
              AND YEAR(rb.check_out_date) = :year
              AND (:month IS NULL OR MONTH(rb.check_out_date) = :month)
            """, nativeQuery = true)
    Long countCheckedOutBookingsByPeriod(@Param("year") Integer year, @Param("month") Integer month);

    /**
     * Monthly breakdown of revenue for chart rendering.
     * Returns [month_num, room_revenue, spa_revenue, food_revenue] for each month in a year.
     */
    @Query(value = """
            SELECT
                MONTH(i.payment_time)   AS month_num,
                SUM(i.room_subtotal)    AS room_rev,
                SUM(i.spa_subtotal)     AS spa_rev,
                SUM(i.food_subtotal)    AS food_rev
            FROM dbo.invoice i
            WHERE i.status = 'PAID'
              AND YEAR(i.payment_time) = :year
            GROUP BY MONTH(i.payment_time)
            ORDER BY MONTH(i.payment_time)
            """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueBreakdown(@Param("year") Integer year);

    // ─── UC25: Therapist Utilization ─────────────────────────────────────────

    /**
     * Therapist session summary for utilization report.
     * Returns [therapist_id, full_name, session_count, total_minutes_worked].
     */
    @Query(value = """
            SELECT
                u.user_id,
                u.full_name,
                COUNT(sb.spa_booking_id)            AS session_count,
                SUM(DATEDIFF(minute, sb.start_datetime, sb.end_datetime)) AS total_minutes
            FROM dbo.spa_booking sb
            INNER JOIN dbo.users u ON u.user_id = sb.therapist_id
            WHERE sb.status = 'COMPLETED'
              AND YEAR(sb.end_datetime) = :year
              AND (:month IS NULL OR MONTH(sb.end_datetime) = :month)
            GROUP BY u.user_id, u.full_name
            ORDER BY total_minutes DESC
            """, nativeQuery = true)
    List<Object[]> findTherapistSessionSummary(@Param("year") Integer year, @Param("month") Integer month);

    /**
     * Scheduled working minutes per therapist from work_schedule.
     * Returns [staff_id, scheduled_minutes].
     */
    @Query(value = """
            SELECT
                ws.staff_id,
                SUM(DATEDIFF(minute,
                    CAST(CAST(ws.work_date AS VARCHAR) + ' ' + CAST(ws.shift_start AS VARCHAR) AS DATETIME2),
                    CAST(CAST(ws.work_date AS VARCHAR) + ' ' + CAST(ws.shift_end AS VARCHAR)   AS DATETIME2)
                )) AS scheduled_minutes
            FROM dbo.work_schedule ws
            WHERE ws.status = 'ACTIVE'
              AND YEAR(ws.work_date) = :year
              AND (:month IS NULL OR MONTH(ws.work_date) = :month)
            GROUP BY ws.staff_id
            """, nativeQuery = true)
    List<Object[]> findTherapistScheduledMinutes(@Param("year") Integer year, @Param("month") Integer month);
}
