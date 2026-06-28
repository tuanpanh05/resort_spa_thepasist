package fu.se.smms.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private String fullName;
    private String specialty;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String role, String fullName) {
        this(token, email, role, fullName, null);
    }

    public LoginResponse(String token, String email, String role, String fullName, String specialty) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.specialty = specialty;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
}
