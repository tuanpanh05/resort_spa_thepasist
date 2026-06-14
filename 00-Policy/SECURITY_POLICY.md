# Security Policy

- Do not hardcode any sensitive credentials (API keys, database passwords, SMTP credentials).
- Use `.env` files for environment-specific secrets.
- Always validate and sanitize user inputs to prevent SQL Injection and XSS attacks.
- Ensure JWT secrets and Encryption keys are adequately complex and securely stored.
- Restrict file permissions appropriately.
