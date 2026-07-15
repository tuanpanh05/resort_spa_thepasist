package fu.se.smms.service.impl;

import fu.se.smms.service.EmailService;
import fu.se.smms.service.InvoicePdfService;
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

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Value("${app.mail.from:noreply@ngusonresort.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:Ngu Son Resort}")
    private String fromName;

    private java.nio.file.Path resolveOtpPath() {
        java.io.File workDir = new java.io.File(System.getProperty("user.dir"));
        java.io.File root = workDir;
        while (workDir != null) {
            if (new java.io.File(workDir, "data_dong_bo").exists() || new java.io.File(workDir, "05-Development").exists()) {
                root = workDir;
                break;
            }
            workDir = workDir.getParentFile();
        }
        return java.nio.file.Path.of(root.getAbsolutePath(), "dev-otp.txt");
    }

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
                java.nio.file.Files.writeString(resolveOtpPath(), content);
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
            // Print FULL stack trace so the real SMTP error (auth/connection) is visible in console
            log.error("Failed to send OTP email to {}. Root cause: {}", toEmail, e.getMessage(), e);
            // Fallback: log OTP to console so dev can still test
            log.warn("===== [FALLBACK] OTP for {} is: {} =====", toEmail, otpCode);
            System.out.println("===================================================");
            System.out.println(" [EMAIL FAILED] OTP for " + toEmail + " : " + otpCode);
            System.out.println(" [EMAIL FAILED] Reason: " + e.getMessage());
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
                    resolveOtpPath(), 
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

    @Override
    public void sendRoomBookingConfirmationEmail(
            String toEmail,
            String guestName,
            Integer bookingId,
            java.time.LocalDateTime checkInDate,
            java.time.LocalDateTime checkOutDate,
            String roomDetails,
            java.math.BigDecimal totalAmount,
            java.math.BigDecimal depositAmount,
            java.math.BigDecimal amountDue) {
        // Write booking confirmation to a local file for developer access
        try {
            String totalAmountStr = String.format("%,.0f VNĐ", totalAmount);
            String depositAmountStr = String.format("%,.0f VNĐ", depositAmount);
            String amountDueStr = String.format("%,.0f VNĐ", amountDue);
            String content = "========================================\n" +
                             "ROOM BOOKING CONFIVERMATION EMAIL\n" +
                             "Email: " + toEmail + "\n" +
                             "Guest Name: " + guestName + "\n" +
                             "Booking ID: #NS-" + bookingId + "\n" +
                             "Check-in: " + checkInDate + "\n" +
                             "Check-out: " + checkOutDate + "\n" +
                             "Rooms: " + roomDetails + "\n" +
                             "Total Amount: " + totalAmountStr + "\n" +
                             "Deposit Paid: " + depositAmountStr + "\n" +
                             "Amount Due: " + amountDueStr + "\n" +
                             "Time Sent: " + java.time.LocalDateTime.now() + "\n" +
                             "========================================\n";
            try {
                java.nio.file.Files.writeString(
                    resolveOtpPath(), 
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
            log.error("Error writing dev-otp.txt file for room booking confirmation: {}", e.getMessage());
        }

        // Skip actual SMTP mail sending for mock/dev domains
        if (toEmail != null && (toEmail.toLowerCase().endsWith("@nguson.com") || toEmail.toLowerCase().endsWith("@nguson.vn"))) {
            log.info("[MOCK EMAIL] Room Booking Confirmation for {} is simulated. Skipping actual SMTP mail sending.", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đặt phòng thành công - Ngũ Sơn Resort & Spa");

            String checkInStr = checkInDate.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
            String checkOutStr = checkOutDate.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
            String totalAmountDisplay = String.format("%,.0f VNĐ", totalAmount);
            String depositAmountDisplay = String.format("%,.0f VNĐ", depositAmount);
            String amountDueDisplay = String.format("%,.0f VNĐ", amountDue);

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
                              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Xác nhận đặt phòng nghỉ dưỡng</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;">
                                Xin chào <strong>%s</strong>,<br/><br/>
                                Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của Ngũ Sơn Resort & Spa. Lịch đặt phòng của quý khách đã được xác nhận thành công sau khi thanh toán tiền đặt cọc. Dưới đây là thông tin chi tiết đặt phòng:
                              </p>
                              <div style="background-color:#f9f9f9; border-left:4px solid #2d5a27; padding:15px; margin:20px 0; font-size:14px;">
                                <p style="margin: 5px 0;"><strong>Mã đặt phòng:</strong> #NS-%d</p>
                                <p style="margin: 5px 0;"><strong>Ngày nhận phòng (Check-in):</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Ngày trả phòng (Check-out):</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Thông tin phòng:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Tổng chi phí:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Tiền cọc đã thanh toán (30%%):</strong> <span style="color:#2d5a27;font-weight:bold;">%s</span></p>
                                <p style="margin: 5px 0;"><strong>Số dư cần thanh toán khi Check-out:</strong> %s</p>
                              </div>
                              <p style="margin:20px 0 0;color:#37474f;font-size:14px;line-height:1.6;">
                                Quý khách vui lòng mang theo giấy tờ tùy thân (CMND/CCCD hoặc Hộ chiếu) để làm thủ tục nhận phòng. Thời gian nhận phòng tiêu chuẩn là 14:00 và trả phòng là 12:00.
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
                """.formatted(guestName, bookingId, checkInStr, checkOutStr, roomDetails, totalAmountDisplay, depositAmountDisplay, amountDueDisplay);

            helper.setText(htmlText, true);
            mailSender.send(message);
            log.info("Room booking confirmation email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send room booking confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    public void sendInvoiceEmail(String toEmail, fu.se.smms.dto.InvoiceDTO invoice) {
        if (toEmail == null || toEmail.isBlank() || invoice == null) {
            log.warn("[Invoice Email] Skipped: missing recipient or invoice data");
            return;
        }

        java.util.function.Function<java.math.BigDecimal, String> money = v ->
                String.format("%,.0f VNĐ", v == null ? java.math.BigDecimal.ZERO : v);

        String guestName = invoice.getCustomerName() != null && !invoice.getCustomerName().isBlank()
                ? invoice.getCustomerName() : "Quý khách";
        String invoiceCode = "#NS-INV-" + invoice.getInvoiceId();
        String roomNumber = invoice.getRoomNumber() != null ? invoice.getRoomNumber() : "N/A";

        java.time.format.DateTimeFormatter dtf =
                java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
        String checkInStr = invoice.getCheckInDate() != null ? invoice.getCheckInDate().format(dtf) : "N/A";
        String checkOutStr = invoice.getCheckOutDate() != null ? invoice.getCheckOutDate().format(dtf) : "N/A";
        String paymentTimeStr = invoice.getPaymentTime() != null
                ? invoice.getPaymentTime().format(dtf)
                : java.time.LocalDateTime.now().format(dtf);
        String paymentMethod = (invoice.getVnpayTranId() != null && !invoice.getVnpayTranId().isBlank())
                ? "VNPay (Mã GD: " + invoice.getVnpayTranId() + ")"
                : "Tiền mặt tại quầy";

        // Dev-only: append invoice info to local file for easy developer access
        try {
            String content = "========================================\n" +
                             "INVOICE EMAIL\n" +
                             "Email: " + toEmail + "\n" +
                             "Invoice: " + invoiceCode + "\n" +
                             "Guest: " + guestName + "\n" +
                             "Total: " + money.apply(invoice.getFinalAmount()) + "\n" +
                             "Payment Method: " + paymentMethod + "\n" +
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
            log.error("Error writing dev-otp.txt file for invoice email: {}", e.getMessage());
        }

        // Skip actual SMTP mail sending for mock/dev domains
        if (toEmail.toLowerCase().endsWith("@nguson.com") || toEmail.toLowerCase().endsWith("@nguson.vn")) {
            log.info("[MOCK EMAIL] Invoice email for {} is simulated. Skipping actual SMTP mail sending.", toEmail);
            return;
        }

        java.util.function.BiFunction<String, String, String> row = (label, val) ->
                "<tr><td style='padding:8px 0;color:#37474f;font-size:14px;border-bottom:1px solid #eef3ee;'>" + label + "</td>"
                + "<td style='padding:8px 0;color:#37474f;font-size:14px;text-align:right;border-bottom:1px solid #eef3ee;'>" + val + "</td></tr>";

        StringBuilder rows = new StringBuilder();
        rows.append(row.apply("Tiền phòng", money.apply(invoice.getRoomSubtotal())));
        if (invoice.getSpaSubtotal() != null && invoice.getSpaSubtotal().signum() > 0) {
            rows.append(row.apply("Dịch vụ Spa", money.apply(invoice.getSpaSubtotal())));
        }
        if (invoice.getFoodSubtotal() != null && invoice.getFoodSubtotal().signum() > 0) {
            rows.append(row.apply("Ẩm thực (F&B)", money.apply(invoice.getFoodSubtotal())));
        }
        rows.append(row.apply("Thuế & phí dịch vụ (10%)", money.apply(invoice.getTaxAndFees())));
        if (invoice.getDepositAmount() != null && invoice.getDepositAmount().signum() > 0) {
            rows.append(row.apply("Đã đặt cọc", "- " + money.apply(invoice.getDepositAmount())));
        }

        String bodyContent =
            "<p style='margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;'>"
                + "Xin chào <strong>" + guestName + "</strong>,<br/><br/>"
                + "Cảm ơn quý khách đã sử dụng dịch vụ tại Ngũ Sơn Resort & Spa. "
                + "Thanh toán của quý khách đã hoàn tất. Dưới đây là hóa đơn chi tiết:</p>"
            + "<div style='background-color:#f9f9f9;border-left:4px solid #2d5a27;padding:15px;margin:20px 0;font-size:14px;'>"
                + "<p style='margin:5px 0;'><strong>Mã hóa đơn:</strong> " + invoiceCode + "</p>"
                + "<p style='margin:5px 0;'><strong>Phòng:</strong> " + roomNumber + "</p>"
                + "<p style='margin:5px 0;'><strong>Nhận phòng:</strong> " + checkInStr + "</p>"
                + "<p style='margin:5px 0;'><strong>Trả phòng:</strong> " + checkOutStr + "</p>"
                + "<p style='margin:5px 0;'><strong>Phương thức thanh toán:</strong> " + paymentMethod + "</p>"
                + "<p style='margin:5px 0;'><strong>Thời gian thanh toán:</strong> " + paymentTimeStr + "</p>"
            + "</div>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='margin:8px 0;'>"
                + rows
                + "<tr><td style='padding:14px 0 0;color:#1b5e20;font-size:16px;font-weight:700;'>Tổng thanh toán</td>"
                + "<td style='padding:14px 0 0;color:#1b5e20;font-size:18px;font-weight:800;text-align:right;'>"
                + money.apply(invoice.getFinalAmount()) + "</td></tr>"
            + "</table>"
            + "<div style='text-align:center;margin:28px 0 8px;'>"
                + "<span style='display:inline-block;background:#e8f5e9;color:#1b5e20;border:1px solid #66bb6a;border-radius:999px;padding:8px 22px;font-size:13px;font-weight:700;letter-spacing:1px;'>ĐÃ THANH TOÁN</span>"
            + "</div>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Hóa đơn thanh toán " + invoiceCode + " - Ngũ Sơn Resort & Spa");

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
                              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Ngũ Sơn Resort &amp; Spa</h1>
                              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Hóa đơn thanh toán</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              %s
                              <hr style="border:none;border-top:1px solid #e8f5e9;margin:24px 0;"/>
                              <p style="margin:0;color:#90a4ae;font-size:12px;text-align:center;line-height:1.6;">
                                Email này được gửi tự động, vui lòng không trả lời.<br/>
                                &copy; 2025 Ngũ Sơn Resort &amp; Spa. Bảo lưu mọi quyền.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(bodyContent);

            helper.setText(htmlText, true);

            // Attach the PDF invoice (with red stamp & signature) when it can be generated
            try {
                byte[] pdf = invoicePdfService.generateInvoicePdf(invoice);
                if (pdf != null && pdf.length > 0) {
                    helper.addAttachment(
                        "HoaDon-" + invoiceCode.replace("#", "") + ".pdf",
                        new org.springframework.core.io.ByteArrayResource(pdf),
                        "application/pdf");
                } else {
                    log.warn("[Invoice Email] PDF generation returned empty for {}", invoiceCode);
                }
            } catch (Exception attEx) {
                log.error("[Invoice Email] Failed to attach PDF: {}", attEx.getMessage());
            }

            mailSender.send(message);
            log.info("Invoice email sent successfully to: {} for invoice {}", toEmail, invoiceCode);

        } catch (Exception e) {
            log.error("Failed to send invoice email to {}: {}", toEmail, e.getMessage());
        }
    }
}
