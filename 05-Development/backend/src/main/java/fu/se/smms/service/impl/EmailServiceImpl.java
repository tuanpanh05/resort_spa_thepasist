package fu.se.smms.service.impl;

import fu.se.smms.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@ngusonresort.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:Ngu Son Resort}")
    private String fromName;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        sendOtpEmail(toEmail, otpCode, false);
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, boolean isForgotPassword) {
        // Write OTP to a local file for easy developer access in dev environment
        try {
            String purpose = isForgotPassword ? "FORGOT PASSWORD" : "REGISTER / ACTIVATE ACCOUNT";
            String content = "========================================\n" +
                             "Email: " + toEmail + "\n" +
                             "Purpose: " + purpose + "\n" +
                             "OTP Code: " + otpCode + "\n" +
                             "Time: " + java.time.LocalDateTime.now() + "\n" +
                             "========================================\n";
            // Write to project root
            try {
                java.nio.file.Files.writeString(java.nio.file.Path.of("d:/Semester5/P/Project/su26-swp391-se2023-g3/dev-otp.txt"), content);
            } catch (Exception ignored) {}
            // Write to relative paths just in case the execution directory differs
            try {
                java.nio.file.Files.writeString(java.nio.file.Path.of("./dev-otp.txt"), content);
            } catch (Exception ignored) {}
            try {
                java.nio.file.Files.writeString(java.nio.file.Path.of("../dev-otp.txt"), content);
            } catch (Exception ignored) {}
            try {
                java.nio.file.Files.writeString(java.nio.file.Path.of("../../dev-otp.txt"), content);
            } catch (Exception ignored) {}
        } catch (Exception e) {
            log.error("Error writing dev-otp.txt file: {}", e.getMessage());
        }

        // Skip sending actual emails to mock/dev domains to prevent Gmail bounces & spam
        if (toEmail != null && (toEmail.toLowerCase().endsWith("@nguson.com") || toEmail.toLowerCase().endsWith("@nguson.vn"))) {
            log.info("[MOCK EMAIL] OTP for {} is simulated. Skipping actual SMTP mail sending.", toEmail);
            log.warn("===== [MOCK EMAIL] OTP for {} is: {} =====", toEmail, otpCode);
            System.out.println("===================================================");
            System.out.println(" [MOCK EMAIL] OTP for " + toEmail + " : " + otpCode);
            System.out.println("===================================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = isForgotPassword 
                ? "Mã xác thực khôi phục tài khoản - Ngũ Sơn Resort & Spa" 
                : "Mã xác thực đăng ký tài khoản - Ngũ Sơn Resort & Spa";

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildHtmlEmail(otpCode, isForgotPassword), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Fallback: log OTP to console so dev can still test
            log.warn("===== [FALLBACK] OTP for {} is: {} =====", toEmail, otpCode);
            System.out.println("===================================================");
            System.out.println(" [EMAIL FAILED] OTP for " + toEmail + " : " + otpCode);
            System.out.println("===================================================");
        }
    }

    private String buildHtmlEmail(String otpCode, boolean isForgotPassword) {
        String title = isForgotPassword ? "Khôi phục tài khoản của bạn" : "Kích hoạt tài khoản của bạn";
        String desc = isForgotPassword 
            ? "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Ngũ Sơn Resort & Spa</strong>. Vui lòng sử dụng mã OTP dưới đây để tiến hành đặt lại mật khẩu:"
            : "Chúng tôi đã nhận được yêu cầu đăng ký tài khoản của bạn tại <strong>Ngũ Sơn Resort & Spa</strong>. Vui lòng sử dụng mã OTP dưới đây để tiến hành kích hoạt tài khoản:";
        String note = isForgotPassword
            ? "🔒 Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn được bảo mật."
            : "🔒 Nếu bạn không thực hiện đăng ký tài khoản, hãy bỏ qua email này.";

        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f0;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#2d5a27,#4a7c3f);padding:40px 40px 30px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">🌿 Ngũ Sơn Resort & Spa</h1>
                          <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">%s</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;">
                            Xin chào,<br/><br/>
                            %s
                          </p>

                          <!-- OTP Box -->
                          <div style="text-align:center;margin:32px 0;">
                            <div style="display:inline-block;background:linear-gradient(135deg,#e8f5e9,#f1f8e9);border:2px dashed #66bb6a;border-radius:16px;padding:24px 48px;">
                              <p style="margin:0 0 8px;color:#558b2f;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Mã xác thực OTP</p>
                              <p style="margin:0;color:#1b5e20;font-size:40px;font-weight:800;letter-spacing:12px;font-family:'Courier New',monospace;">%s</p>
                            </div>
                          </div>

                          <p style="margin:0 0 12px;color:#37474f;font-size:14px;line-height:1.6;">
                            ⏱️ Mã OTP có hiệu lực trong <strong>10 phút</strong>.
                          </p>
                          <p style="margin:0 0 24px;color:#37474f;font-size:14px;line-height:1.6;">
                            %s
                          </p>

                          <hr style="border:none;border-top:1px solid #e8f5e9;margin:24px 0;"/>
                          <p style="margin:0;color:#90a4ae;font-size:12px;text-align:center;line-height:1.6;">
                            Email này được gửi tự động, vui lòng không trả lời.<br/>
                            &copy; 2025 Ngũ Sơn Resort & Spa. Bảo lưu mọi quyền.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, desc, otpCode, note);
    }

    @Override
    public void sendSpaReminderEmail(String toEmail, String guestName, String serviceName, java.time.LocalDateTime startDatetime) {
        // Write reminder to a local file for easy developer access in dev environment
        try {
            String content = "========================================\n" +
                             "SPA REMINDER EMAIL\n" +
                             "Email: " + toEmail + "\n" +
                             "Guest Name: " + guestName + "\n" +
                             "Service Name: " + serviceName + "\n" +
                             "Start Time: " + startDatetime + "\n" +
                             "Time Sent: " + java.time.LocalDateTime.now() + "\n" +
                             "========================================\n";
            try {
                java.nio.file.Files.writeString(
                    java.nio.file.Path.of("./dev-otp.txt"), 
                    content, 
                    java.nio.file.StandardOpenOption.CREATE, 
                    java.nio.file.StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
        } catch (Exception e) {
            log.error("Error writing dev-otp.txt file for spa reminder: {}", e.getMessage());
        }

        // Skip actual SMTP mail sending for mock/dev domains
        if (toEmail != null && (toEmail.toLowerCase().endsWith("@nguson.com") || toEmail.toLowerCase().endsWith("@nguson.vn"))) {
            log.info("[MOCK EMAIL] Spa Reminder for {} is simulated. Skipping actual SMTP mail sending.", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Nhắc nhở lịch hẹn dịch vụ Spa - Ngũ Sơn Resort & Spa");

            String htmlText = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body style="margin:0;padding:0;background-color:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f0;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background:linear-gradient(135deg,#2d5a27,#4a7c3f);padding:40px 40px 30px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">🌿 Ngũ Sơn Resort & Spa</h1>
                              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Nhắc nhở lịch hẹn trị liệu Spa</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;">
                                Xin chào <strong>%s</strong>,<br/><br/>
                                Lịch hẹn trị liệu Spa của bạn sẽ bắt đầu sau 1 giờ nữa. Dưới đây là thông tin chi tiết lịch hẹn:
                              </p>
                              <div style="background-color:#f9f9f9; border-left:4px solid #2d5a27; padding:15px; margin:20px 0; font-size:14px;">
                                <p style="margin: 5px 0;"><strong>Dịch vụ:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Thời gian bắt đầu:</strong> %s</p>
                              </div>
                              <p style="margin:20px 0 0;color:#37474f;font-size:14px;line-height:1.6;">
                                Quý khách vui lòng đến trước giờ hẹn 10 phút để chuẩn bị tốt nhất cho buổi trị liệu.
                              </p>
                              <hr style="border:none;border-top:1px solid #e8f5e9;margin:24px 0;"/>
                              <p style="margin:0;color:#90a4ae;font-size:12px;text-align:center;line-height:1.6;">
                                Email này được gửi tự động, vui lòng không trả lời.<br/>
                                &copy; 2025 Ngũ Sơn Resort & Spa. Bảo lưu mọi quyền.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(guestName, serviceName, startDatetime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")));

            helper.setText(htmlText, true);
            mailSender.send(message);
            log.info("Spa reminder email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send Spa reminder email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    public void sendSpaBookingConfirmationEmail(String toEmail, String guestName, String serviceName, java.time.LocalDateTime startDatetime, String therapistName, String roomName, boolean isPackageIncluded, java.math.BigDecimal price) {
        // Write booking confirmation to a local file for developer access
        try {
            String priceStr = isPackageIncluded ? "Miễn phí theo gói (Package Included)" : String.format("%,.0f VNĐ", price);
            String content = "========================================\n" +
                             "SPA BOOKING CONFIRMATION EMAIL\n" +
                             "Email: " + toEmail + "\n" +
                             "Guest Name: " + guestName + "\n" +
                             "Service Name: " + serviceName + "\n" +
                             "Start Time: " + startDatetime + "\n" +
                             "Therapist: " + therapistName + "\n" +
                             "Room: " + roomName + "\n" +
                             "Price: " + priceStr + "\n" +
                             "Time Sent: " + java.time.LocalDateTime.now() + "\n" +
                             "========================================\n";
            try {
                java.nio.file.Files.writeString(
                    java.nio.file.Path.of("d:/Semester5/P/Project/su26-swp391-se2023-g3/dev-otp.txt"), 
                    content, 
                    java.nio.file.StandardOpenOption.CREATE, 
                    java.nio.file.StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
            try {
                java.nio.file.Files.writeString(
                    java.nio.file.Path.of("./dev-otp.txt"), 
                    content, 
                    java.nio.file.StandardOpenOption.CREATE, 
                    java.nio.file.StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
        } catch (Exception e) {
            log.error("Error writing dev-otp.txt file for spa confirmation: {}", e.getMessage());
        }

        // Skip actual SMTP mail sending for mock/dev domains
        if (toEmail != null && (toEmail.toLowerCase().endsWith("@nguson.com") || toEmail.toLowerCase().endsWith("@nguson.vn"))) {
            log.info("[MOCK EMAIL] Spa Confirmation for {} is simulated. Skipping actual SMTP mail sending.", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận lịch hẹn dịch vụ Spa thành công - Ngũ Sơn Resort & Spa");

            String priceDisplay = isPackageIncluded ? "Miễn phí (Theo gói trị liệu)" : String.format("%,.0f VNĐ", price);
            String formattedDate = startDatetime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));

            String htmlText = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body style="margin:0;padding:0;background-color:#f0f4f0;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f0;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background:linear-gradient(135deg,#2d5a27,#4a7c3f);padding:40px 40px 30px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">🌿 Ngũ Sơn Resort & Spa</h1>
                              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Đặt lịch Spa thành công</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;">
                                Xin chào <strong>%s</strong>,<br/><br/>
                                Chúc mừng quý khách đã đặt lịch hẹn dịch vụ Spa thành công tại Ngũ Sơn Resort & Spa. Dưới đây là thông tin chi tiết:
                              </p>
                              <div style="background-color:#f9f9f9; border-left:4px solid #2d5a27; padding:15px; margin:20px 0; font-size:14px;">
                                <p style="margin: 5px 0;"><strong>Dịch vụ:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Thời gian:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Kỹ thuật viên:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Phòng trị liệu:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Chi phí:</strong> %s</p>
                              </div>
                              <p style="margin:20px 0 0;color:#37474f;font-size:14px;line-height:1.6;">
                                Quý khách vui lòng có mặt tại khu vực Spa trước giờ hẹn 10 phút để buổi trị liệu được diễn ra trọn vẹn và chu đáo nhất.
                              </p>
                              <hr style="border:none;border-top:1px solid #e8f5e9;margin:24px 0;"/>
                              <p style="margin:0;color:#90a4ae;font-size:12px;text-align:center;line-height:1.6;">
                                Email này được gửi tự động, vui lòng không trả lời.<br/>
                                &copy; 2025 Ngũ Sơn Resort & Spa. Bảo lưu mọi quyền.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(guestName, serviceName, formattedDate, therapistName, roomName, priceDisplay);

            helper.setText(htmlText, true);
            mailSender.send(message);
            log.info("Spa booking confirmation email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send Spa booking confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }
}
