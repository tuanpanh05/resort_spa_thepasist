package fu.se.smms.dto;

import java.time.LocalDateTime;

public class UserProfileDTO {
    private Integer userId;
    private String email;
    private String fullName;
    private String phone;
    private String idPassport;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public UserProfileDTO() {}

    public UserProfileDTO(Integer userId, String email, String fullName, String phone, String idPassport, String role, String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.idPassport = idPassport;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer userId;
        private String email;
        private String fullName;
        private String phone;
        private String idPassport;
        private String role;
        private String status;
        private LocalDateTime createdAt;

        public Builder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder idPassport(String idPassport) {
            this.idPassport = idPassport;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserProfileDTO build() {
            return new UserProfileDTO(userId, email, fullName, phone, idPassport, role, status, createdAt);
        }
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getIdPassport() {
        return idPassport;
    }

    public void setIdPassport(String idPassport) {
        this.idPassport = idPassport;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
