package fu.se.smms.service.impl;

import fu.se.smms.entity.OtpToken;
import fu.se.smms.entity.User;
import fu.se.smms.repository.OtpTokenRepository;
import fu.se.smms.repository.UserRepository;
import fu.se.smms.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    private static final int OTP_EXPIRY_MINUTES = 10;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void generateAndSendOtp(String email) {
        // Verify the email belongs to an existing user
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này."));

        // Invalidate all previous OTPs for this email
        otpTokenRepository.deleteAllByEmail(email);

        // Generate new 6-digit OTP
        String otpCode = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        OtpToken token = new OtpToken(email, otpCode, expiresAt);
        otpTokenRepository.save(token);

        // DEV MODE: Print OTP to console. In production, replace with actual email sending.
        log.warn("===== [DEV MODE] OTP for {} is: {} (expires in {} minutes) =====",
                email, otpCode, OTP_EXPIRY_MINUTES);
        System.out.println("===================================================");
        System.out.println(" OTP for " + email + " : " + otpCode);
        System.out.println("===================================================");
    }

    @Override
    public void verifyOtp(String email, String otpCode) {
        Optional<OtpToken> tokenOpt = otpTokenRepository
                .findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(email);

        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.");
        }

        OtpToken token = tokenOpt.get();

        if (token.isExpired()) {
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.");
        }

        if (!token.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không chính xác. Vui lòng kiểm tra lại.");
        }
        // OTP is valid - do NOT mark as used yet (user still needs to submit new password)
    }

    @Override
    public void resetPassword(String email, String otpCode, String newPassword) {
        // Re-verify OTP before allowing password change
        Optional<OtpToken> tokenOpt = otpTokenRepository
                .findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(email);

        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Phiên đặt lại mật khẩu không hợp lệ. Vui lòng bắt đầu lại.");
        }

        OtpToken token = tokenOpt.get();

        if (token.isExpired()) {
            throw new RuntimeException("Phiên đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại.");
        }

        if (!token.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Xác thực OTP thất bại.");
        }

        // Mark OTP as used (invalidate it)
        token.setIsUsed(true);
        otpTokenRepository.save(token);

        // Update user's password
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password for {} has been successfully reset.", email);
    }
}
