package fu.se.smms.service;

public interface EmailService {
    /**
     * Sends an HTML OTP email to the specified recipient.
     * @param toEmail recipient's email address
     * @param otpCode the 6-digit OTP code to include in the email
     */
    void sendOtpEmail(String toEmail, String otpCode);
}
