package fu.se.smms.dto;

import jakarta.validation.constraints.NotNull;

public class AdminUpdateUserRequest {

    @NotNull(message = "Role is required")
    private String role; // ADMIN, STAFF, THERAPIST, CHEF, RECEPTIONIST, GUEST

    private String status; // ACTIVE, INACTIVE, BANNED

    private String specialty;

    public AdminUpdateUserRequest() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
}
