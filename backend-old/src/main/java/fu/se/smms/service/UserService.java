package fu.se.smms.service;

import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.dto.RegisterRequestDTO;
import fu.se.smms.dto.UserDTO;

/**
 * IUserService — Interface for authentication and user management.
 * Covers UC01, UC02, UC03, UC04, UC05 from Module 1 spec.
 * @version 1.0
 */
public interface UserService {

    /**
     * UC01 — Register a new customer account.
     * Sets status = INACTIVE pending email verification (BR-02).
     * Rejects duplicate emails (BR-01).
     * @throws fu.se.smms.exception.BusinessException AUTH-001 if email already exists.
     */
    UserDTO register(RegisterRequestDTO dto);

    /**
     * UC01 — Activate account via email OTP/token (BR-02).
     * Flips status from INACTIVE → ACTIVE.
     * @throws fu.se.smms.exception.BusinessException AUTH-404 if user not found or token invalid.
     */
    void verifyEmailToken(String email, String token);

    /**
     * UC03 / BR-22 — Admin locks or unlocks a staff account.
     * Sets status = INACTIVE (locked) or ACTIVE.
     * @throws fu.se.smms.exception.BusinessException AUTH-404 if staff not found.
     */
    UserDTO updateStaffStatus(Integer staffId, String newStatus);
}
