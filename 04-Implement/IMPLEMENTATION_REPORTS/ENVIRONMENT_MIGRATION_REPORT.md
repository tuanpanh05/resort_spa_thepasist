# Environment Migration Report

## What was changed
Consolidated and verified all hardcoded environment configurations across frontend and backend.
Specifically, in the backend `application.properties`, we identified hardcoded VNPay URLs (`payment.vnpay.pay-url` and `payment.vnpay.return-url`) and migrated them to use environment variables (`VNP_PAY_URL` and `VNP_RETURN_URL`) with fallback values.

## Why it was changed
To comply with the `00-Policy/SECURITY_POLICY.md` which dictates that no hardcoded configurations or sensitive information should reside directly in source code. This allows the application to be deployed across different environments (e.g., Development, Staging, Production) seamlessly by only altering the `.env` file.

## Files Modified
- `05-Development/backend/src/main/resources/application.properties`

## Risks
If the `.env` file is missing or lacks these variables on a production server, it will fallback to the local/sandbox values, potentially causing production transactions to hit sandbox endpoints.

## Recommended next steps
- Set up proper environment secrets in the CI/CD pipeline (e.g., GitHub Actions Secrets or Jenkins Credentials) before production deployment.
- Ensure all developers have an updated `.env` file locally for development.
