-- Migration: Add voucher table + invoice voucher/discount columns
-- Fixes "Transaction silently rolled back / marked as rollback-only" during
-- booking creation and VNPay payment. The Invoice entity maps voucher_id,
-- discount_amount and a Voucher association that did not exist in the DB,
-- so Hibernate failed on save and poisoned the transaction.
-- Idempotent: safe to run multiple times.

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.voucher','U') IS NULL
BEGIN
    CREATE TABLE dbo.voucher (
        voucher_id          INT IDENTITY(1,1) PRIMARY KEY,
        code                VARCHAR(50)   NOT NULL UNIQUE,
        discount_type       VARCHAR(20)   NOT NULL,         -- PERCENTAGE | FIXED_AMOUNT
        discount_value      DECIMAL(12,2) NOT NULL,
        max_discount_amount DECIMAL(12,2) NULL,
        min_booking_amount  DECIMAL(12,2) NULL DEFAULT(0),
        start_date          DATETIME2     NOT NULL,
        expiry_date         DATETIME2     NOT NULL,
        usage_limit         INT           NULL DEFAULT(100),
        used_count          INT           NULL DEFAULT(0),
        status              VARCHAR(20)   NULL DEFAULT('ACTIVE'),
        created_at          DATETIME2     NULL
    );
END

IF COL_LENGTH('dbo.invoice','discount_amount') IS NULL
    ALTER TABLE dbo.invoice ADD discount_amount DECIMAL(12,2) NOT NULL
        CONSTRAINT DF_invoice_discount_amount DEFAULT(0);

IF COL_LENGTH('dbo.invoice','voucher_id') IS NULL
    ALTER TABLE dbo.invoice ADD voucher_id INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_invoice_voucher')
    ALTER TABLE dbo.invoice WITH CHECK
        ADD CONSTRAINT FK_invoice_voucher FOREIGN KEY (voucher_id)
        REFERENCES dbo.voucher (voucher_id);

COMMIT TRANSACTION;