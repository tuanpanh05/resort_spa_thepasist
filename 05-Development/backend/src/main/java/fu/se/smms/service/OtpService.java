package fu.se.smms.service;

public interface OtpService {
    /**
     * Generates a 6-digit OTP, persists it, and sends it via email (or logs to console in dev mode).
     * @param email the target email address
     */
    void generateAndSendOtp(String email);

    /**
     * Validates the OTP code for the given email. Throws RuntimeException if invalid/expired.
     * @param email the email address
     * @param otpCode the OTP code entered by the user
     */
    void verifyOtp(String email, String otpCode);

    /**
     * Verifies OTP and updates the user's password. Invalidates the OTP after use.
     * @param email the email address
     * @param otpCode the OTP code
     * @param newPassword the new plain-text password
     */
    void resetPassword(String email, String otpCode, String newPassword);

    /**
     * Verifies the OTP and immediately marks it as used/invalidated.
     * @param email the email address
     * @param otpCode the OTP code
     */
    void verifyAndUseOtp(String email, String otpCode);
}
