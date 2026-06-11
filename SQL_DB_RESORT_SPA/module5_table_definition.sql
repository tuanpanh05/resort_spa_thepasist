-- =========================================================================
-- MODULE 5: Consolidated Checkout & Analytics - Database Schema Definitions
-- Project: Ngu Son Resort & Spa Management System (NSRMS)
-- Purpose: Dedicated SQL definitions for Module 5 tables and constraints
--          to assist with tracking and isolated migrations.
-- =========================================================================

USE ResortSpaDB;
GO

-- =========================================================================
-- 1. Payment Transaction Log Table (BR-26: Transaction Audit Trail)
-- This table records all payments made through VNPay or cash at checkout.
-- It is designed to be append-only (immutable trail).
-- =========================================================================

IF OBJECT_ID('dbo.payment_transaction_log', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.payment_transaction_log;
END
GO

CREATE TABLE dbo.payment_transaction_log (
    log_id              INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id          INT NOT NULL,
    payment_method      VARCHAR(50)     NOT NULL,  -- 'VNPAY' | 'CASH' | 'STRIPE' | 'PAYPAL'
    amount              DECIMAL(15,2)   NOT NULL,  -- Financial values must use DECIMAL
    gateway_ref         VARCHAR(100)    NULL,       -- VNPay transaction number (null for CASH)
    response_code       VARCHAR(10)     NULL,       -- '00' = Success response code
    status              VARCHAR(20)     NOT NULL,   -- 'PAID' | 'FAILED' | 'REFUNDED'
    transaction_time    DATETIME2       NOT NULL DEFAULT GETDATE(), -- Immutable record timestamp
    client_ip           VARCHAR(45)     NULL,

    CONSTRAINT CK_ptl_Method CHECK (payment_method IN ('VNPAY', 'CASH', 'STRIPE', 'PAYPAL')),
    CONSTRAINT CK_ptl_Status CHECK (status IN ('PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT CK_ptl_Amount CHECK (amount >= 0),
    CONSTRAINT FK_ptl_invoice FOREIGN KEY (invoice_id) REFERENCES dbo.invoice(invoice_id) ON DELETE NO ACTION
);
GO

-- =========================================================================
-- 2. Performance Tuning Indexes for payment_transaction_log
-- =========================================================================

CREATE INDEX IX_ptl_invoice ON dbo.payment_transaction_log(invoice_id);
CREATE INDEX IX_ptl_gateway_ref ON dbo.payment_transaction_log(gateway_ref);
CREATE INDEX IX_ptl_transaction_time ON dbo.payment_transaction_log(transaction_time);
GO

-- =========================================================================
-- 3. Feedback Constraint Modification (BR-19: One review per booking)
-- Adds a database-level unique constraint to enforce single reviews.
-- =========================================================================

IF EXISTS (
    SELECT 1 FROM sys.tables 
    WHERE name = 'feedback' AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    -- Only add UQ constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = 'UQ_feedback_room_booking' AND object_id = OBJECT_ID('dbo.feedback')
    )
    BEGIN
        ALTER TABLE dbo.feedback
        ADD CONSTRAINT UQ_feedback_room_booking UNIQUE (room_booking_id);
    END
END
GO
