package fu.se.smms.service;

public interface EmailService {
    /**
     * Sends an HTML OTP email to the specified recipient.
     * @param toEmail recipient's email address
     * @param otpCode the 6-digit OTP code to include in the email
     */
    void sendOtpEmail(String toEmail, String otpCode);

    /**
     * Sends an HTML OTP email to the specified recipient with customized registration/recovery copy.
     * @param toEmail recipient's email address
     * @param otpCode the 6-digit OTP code to include in the email
     * @param isForgotPassword true if for password reset, false if for registration/activation
     */
    void sendOtpEmail(String toEmail, String otpCode, boolean isForgotPassword);

    /**
     * Sends an HTML email reminder for an upcoming spa session.
     * @param toEmail recipient's email address
     * @param guestName name of the guest
     * @param serviceName name of the booked spa service
     * @param startDatetime the scheduled start date and time
     */
    void sendSpaReminderEmail(String toEmail, String guestName, String serviceName, java.time.LocalDateTime startDatetime);

    /**
     * Sends an HTML email confirmation for a successfully scheduled spa session.
     * @param toEmail recipient's email address
     * @param guestName name of the guest
     * @param serviceName name of the booked spa service
     * @param startDatetime the scheduled start date and time
     * @param therapistName name of the assigned spa therapist
     * @param roomName name of the treatment room
     * @param isPackageIncluded true if the session is included in a retreat package (price is zero)
     * @param price the price of the booking if not included in package
     */
    void sendSpaBookingConfirmationEmail(String toEmail, String guestName, String serviceName, java.time.LocalDateTime startDatetime, String therapistName, String roomName, boolean isPackageIncluded, java.math.BigDecimal price);
}
