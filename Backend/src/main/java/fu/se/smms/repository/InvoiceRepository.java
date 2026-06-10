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

    @Query(value = """
            SELECT COALESCE(
                CASE
                    WHEN b.package_id IS NOT NULL THEN p.base_price
                    ELSE room_charge.room_subtotal
                END,
                0
            )
            FROM dbo.room_booking b
            LEFT JOIN dbo.retreat_package p ON p.package_id = b.package_id
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
}
