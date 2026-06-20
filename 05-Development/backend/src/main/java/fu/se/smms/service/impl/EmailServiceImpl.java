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

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Mã xác thực OTP - Ngũ Sơn Resort & Spa");
            helper.setText(buildHtmlEmail(otpCode), true);

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

    private String buildHtmlEmail(String otpCode) {
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
                          <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Khôi phục tài khoản của bạn</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 20px;color:#37474f;font-size:15px;line-height:1.6;">
                            Xin chào,<br/><br/>
                            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Ngũ Sơn Resort & Spa</strong>.
                            Vui lòng sử dụng mã OTP dưới đây để tiến hành đặt lại mật khẩu:
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
                            🔒 Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn được bảo mật.
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
            """.formatted(otpCode);
    }
}
