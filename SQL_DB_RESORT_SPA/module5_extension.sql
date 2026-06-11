-- =========================================================================
-- Module 5: Consolidated Checkout & Analytics - Database Extension Script
-- Project: Ngu Son Resort & Spa Management System (NSRMS)
-- Purpose: Adds payment_transaction_log table (BR-26 Audit Trail) and
--          seeds additional test data for UC21-UC25 testing.
-- Run AFTER the main resort_spa_db.sql script.
-- =========================================================================

USE ResortSpaDB;
GO

-- =========================================================================
-- STEP 1: Add payment_transaction_log table (BR-26 - Audit Trail)
-- This table is append-only; no DELETE or UPDATE allowed in production.
-- =========================================================================

IF OBJECT_ID('dbo.payment_transaction_log', 'U') IS NOT NULL
    DROP TABLE dbo.payment_transaction_log;
GO

CREATE TABLE dbo.payment_transaction_log (
    log_id              INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id          INT NOT NULL,
    payment_method      VARCHAR(50)     NOT NULL,  -- 'VNPAY' | 'CASH'
    amount              DECIMAL(15,2)   NOT NULL,
    gateway_ref         VARCHAR(100)    NULL,       -- VNPay transaction ID (null for CASH)
    response_code       VARCHAR(10)     NULL,       -- '00' = success, VNPay codes
    status              VARCHAR(20)     NOT NULL,   -- 'PAID' | 'FAILED' | 'REFUNDED'
    transaction_time    DATETIME2       NOT NULL DEFAULT GETDATE(),
    client_ip           VARCHAR(45)     NULL,

    CONSTRAINT CK_ptl_Method CHECK (payment_method IN ('VNPAY', 'CASH', 'STRIPE', 'PAYPAL')),
    CONSTRAINT CK_ptl_Status CHECK (status IN ('PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT CK_ptl_Amount CHECK (amount >= 0),
    CONSTRAINT FK_ptl_invoice FOREIGN KEY (invoice_id) REFERENCES dbo.invoice(invoice_id) ON DELETE NO ACTION
);

-- Index for audit queries
CREATE INDEX IX_ptl_invoice ON dbo.payment_transaction_log(invoice_id);
CREATE INDEX IX_ptl_gateway_ref ON dbo.payment_transaction_log(gateway_ref);
CREATE INDEX IX_ptl_transaction_time ON dbo.payment_transaction_log(transaction_time);

GO

-- =========================================================================
-- STEP 2: Verify Module 5 DB constraints on existing tables
-- These should already exist from resort_spa_db.sql, but we verify here.
-- =========================================================================

-- 2.1 Verify feedback table has correct constraints
-- BR-18: Only CHECKED_OUT bookings can have feedback → enforced at service layer
-- BR-19: One feedback per booking
-- The existing FEEDBACK table has no UNIQUE constraint on room_booking_id,
-- so BR-19 is enforced at service layer (existsByRoomBooking_BookingId check).

-- Optional: Add unique constraint to enforce BR-19 at DB level
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UQ_feedback_room_booking' AND object_id = OBJECT_ID('dbo.feedback')
)
BEGIN
    -- Note: Only add if there's no existing duplicate (cleaning up seed data first)
    ALTER TABLE dbo.feedback
    ADD CONSTRAINT UQ_feedback_room_booking UNIQUE (room_booking_id);
END
GO

-- =========================================================================
-- STEP 3: Seed additional test data for Module 5 UC testing
-- =========================================================================

-- 3.1 Add a CHECKED_OUT booking for UC23 (feedback) testing
-- First, update the existing booking 1 to CHECKED_OUT to simulate post-checkout state
-- Note: This is only for testing; in production checkout happens through the API.

-- Add a second invoice for booking 2 (for payment testing)
-- Check if it doesn't exist yet
IF NOT EXISTS (SELECT 1 FROM dbo.invoice WHERE room_booking_id = 2)
BEGIN
    INSERT INTO dbo.invoice (
        user_id, room_booking_id,
        room_subtotal, spa_subtotal, food_subtotal,
        tax_and_fees, final_amount, deposit_amount, amount_due,
        status, vnpay_tran_id, payment_time
    ) VALUES (
        6, 2,
        9000000.00,     -- Villa-102 for 2 nights (4500000 * 2 = 9000000)
        1500000.00,     -- 1 spa session (Spinal Adjustment, a-la-carte)
        415000.00,      -- Food order: chicken soup (320000) + detox juice (95000)
        1091500.00,     -- (9000000+1500000+415000) * 10% = 1,091,500
        12006500.00,    -- 10,915,000 + 1,091,500 = 12,006,500
        2700000.00,     -- 30% deposit paid online
        9306500.00,     -- 12,006,500 - 2,700,000 = 9,306,500
        'UNPAID', NULL, NULL
    );
END
GO

-- 3.2 Seed transaction log for the first invoice (simulating past payment)
-- This represents the 30% deposit payment that was done during booking
IF NOT EXISTS (SELECT 1 FROM dbo.payment_transaction_log WHERE invoice_id = 1)
BEGIN
    -- Initial deposit for booking 1 was paid via VNPay during booking
    INSERT INTO dbo.payment_transaction_log (
        invoice_id, payment_method, amount, gateway_ref,
        response_code, status, transaction_time, client_ip
    ) VALUES (
        1, 'VNPAY', 3750000.00, 'VNP-DEPOSIT-001',
        '00', 'PAID', DATEADD(day, -7, GETDATE()), '127.0.0.1'
    );
END
GO

-- 3.3 Add a COMPLETED spa booking (for testing checkout lock releasing)
-- Booking 1's spa session needs to be COMPLETED before checkout is allowed
-- Update spa session for booking 1 to COMPLETED
UPDATE dbo.spa_booking
SET status = 'COMPLETED'
WHERE room_booking_id = 1
  AND spa_booking_id = 1;
GO

-- 3.4 Verify no pending orders block checkout for booking 1
-- This query should return 0 for booking 1:
SELECT
    'Booking 1 - Pending Spa' AS check_type,
    COUNT(*) AS pending_count
FROM dbo.spa_booking
WHERE room_booking_id = 1
  AND status IN ('PENDING', 'CONFIRMED')
UNION ALL
SELECT
    'Booking 1 - Pending Food' AS check_type,
    COUNT(*) AS pending_count
FROM dbo.food_order
WHERE room_booking_id = 1
  AND status IN ('PENDING', 'PREPARING');
GO

-- =========================================================================
-- STEP 4: Verification queries for Module 5
-- =========================================================================

-- 4.1 Revenue dashboard verification (UC24)
SELECT
    'Revenue Dashboard UC24' AS test_case,
    YEAR(i.payment_time) AS year,
    MONTH(i.payment_time) AS month,
    SUM(i.room_subtotal)    AS room_revenue,
    SUM(i.spa_subtotal)     AS spa_revenue,
    SUM(i.food_subtotal)    AS food_revenue,
    SUM(i.tax_and_fees)     AS tax_revenue,
    SUM(i.final_amount)     AS grand_total
FROM dbo.invoice i
WHERE i.status = 'PAID'
GROUP BY YEAR(i.payment_time), MONTH(i.payment_time);

-- 4.2 Invoice details for testing (UC21, UC22)
SELECT
    i.invoice_id,
    u.full_name AS customer_name,
    rb.status AS booking_status,
    i.room_subtotal,
    i.spa_subtotal,
    i.food_subtotal,
    i.tax_and_fees,
    i.final_amount,
    i.deposit_amount,
    i.amount_due,
    i.status AS invoice_status
FROM dbo.invoice i
INNER JOIN dbo.[User] u ON u.user_id = i.user_id
INNER JOIN dbo.room_booking rb ON rb.booking_id = i.room_booking_id
ORDER BY i.invoice_id;

-- 4.3 Therapist utilization check (UC25)
SELECT
    u.full_name AS therapist_name,
    COUNT(sb.spa_booking_id) AS sessions_completed,
    SUM(DATEDIFF(minute, sb.start_datetime, sb.end_datetime)) AS total_minutes_worked
FROM dbo.spa_booking sb
INNER JOIN dbo.[User] u ON u.user_id = sb.therapist_id
WHERE sb.status = 'COMPLETED'
GROUP BY u.user_id, u.full_name;

-- 4.4 Checkout lock validation query (Consolidated Billing Constraint)
SELECT
    rb.booking_id,
    u.full_name AS customer,
    rb.status AS booking_status,
    (SELECT COUNT(*) FROM dbo.spa_booking s
     WHERE s.room_booking_id = rb.booking_id AND s.status IN ('PENDING','CONFIRMED')) AS pending_spa,
    (SELECT COUNT(*) FROM dbo.food_order fo
     WHERE fo.room_booking_id = rb.booking_id AND fo.status IN ('PENDING','PREPARING')) AS pending_food,
    CASE
        WHEN (SELECT COUNT(*) FROM dbo.spa_booking s
              WHERE s.room_booking_id = rb.booking_id AND s.status IN ('PENDING','CONFIRMED')) = 0
         AND (SELECT COUNT(*) FROM dbo.food_order fo
              WHERE fo.room_booking_id = rb.booking_id AND fo.status IN ('PENDING','PREPARING')) = 0
        THEN 'CHECKOUT ALLOWED'
        ELSE 'CHECKOUT BLOCKED'
    END AS checkout_lock_status
FROM dbo.room_booking rb
INNER JOIN dbo.[User] u ON u.user_id = rb.user_id
WHERE rb.status IN ('CONFIRMED', 'CHECKED_IN');

-- 4.5 Audit trail verification (BR-26)
SELECT
    ptl.log_id,
    i.invoice_id,
    ptl.payment_method,
    ptl.amount,
    ptl.gateway_ref,
    ptl.response_code,
    ptl.status,
    ptl.transaction_time,
    ptl.client_ip
FROM dbo.payment_transaction_log ptl
INNER JOIN dbo.invoice i ON i.invoice_id = ptl.invoice_id
ORDER BY ptl.transaction_time DESC;

-- =========================================================================
-- END OF MODULE 5 EXTENSION SCRIPT
-- =========================================================================
