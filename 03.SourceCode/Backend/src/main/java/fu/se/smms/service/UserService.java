package fu.se.smms.service;

import fu.se.smms.dto.*;
import java.util.List;

public interface UserService {
    LoginResponse login(LoginRequest request);
    LoginResponse loginWithGoogle(GoogleLoginRequest request);
    UserProfileDTO signUp(SignUpRequest request);
    UserProfileDTO getUserProfile(String email);
    UserProfileDTO updateUserProfile(String email, UserProfileRequest request);

    // Profile – Booking history (Customer Profile Dashboard)
    List<BookingHistoryDTO> getMyRoomBookings(String email);
    List<SpaBookingHistoryDTO> getMySpaBookings(String email);

    // Profile – Change password
    void changePassword(String email, ChangePasswordRequest request);

    // Admin methods (UC03)
    List<UserProfileDTO> getAllStaffUsers();
    UserProfileDTO updateUserRoleAndStatus(Integer userId, String role, String status);
    void deleteUser(Integer userId);
    UserProfileDTO createStaffAccount(SignUpRequest request, String role);
}

