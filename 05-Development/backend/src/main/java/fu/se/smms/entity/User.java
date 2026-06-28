package fu.se.smms.entity;

import fu.se.smms.config.AesEncryptor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "id_passport_encrypted", columnDefinition = "VARCHAR(MAX)")
    @Convert(converter = AesEncryptor.class)
    private String idPassportEncrypted;

    @Column(name = "role", nullable = false)
    private String role; // Values: ADMIN, STAFF, THERAPIST, GUEST

    @Column(name = "status", nullable = false)
    private String status; // Values: ACTIVE, INACTIVE, BANNED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "google_calendar_sync_enabled")
    private Boolean googleCalendarSyncEnabled = false;

    @Column(name = "google_calendar_id")
    private String googleCalendarId;

    @Column(name = "calendar_reminders_enabled")
    private Boolean calendarRemindersEnabled = true;

    @Column(name = "reminder_lead_time_mins")
    private Integer reminderLeadTimeMins = 30;

    @Column(name = "specialty", length = 20)
    private String specialty;

    public User() {}

    public User(Integer userId, String email, String passwordHash, String fullName, String phone, String idPassportEncrypted, String role, String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.phone = phone;
        this.idPassportEncrypted = idPassportEncrypted;
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
        private String passwordHash;
        private String fullName;
        private String phone;
        private String idPassportEncrypted;
        private String role;
        private String status;
        private LocalDateTime createdAt;
        private String specialty;

        public Builder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
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

        public Builder idPassportEncrypted(String idPassportEncrypted) {
            this.idPassportEncrypted = idPassportEncrypted;
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

        public Builder specialty(String specialty) {
            this.specialty = specialty;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public User build() {
            User u = new User(userId, email, passwordHash, fullName, phone, idPassportEncrypted, role, status, createdAt);
            u.setSpecialty(specialty);
            return u;
        }
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == null) {
            role = "GUEST";
        }
        if (status == null) {
            status = "ACTIVE";
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

    public String getIdPassportEncrypted() {
        return idPassportEncrypted;
    }

    public void setIdPassportEncrypted(String idPassportEncrypted) {
        this.idPassportEncrypted = idPassportEncrypted;
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

    public Boolean getGoogleCalendarSyncEnabled() {
        return googleCalendarSyncEnabled;
    }

    public void setGoogleCalendarSyncEnabled(Boolean googleCalendarSyncEnabled) {
        this.googleCalendarSyncEnabled = googleCalendarSyncEnabled;
    }

    public String getGoogleCalendarId() {
        return googleCalendarId;
    }

    public void setGoogleCalendarId(String googleCalendarId) {
        this.googleCalendarId = googleCalendarId;
    }

    public Boolean getCalendarRemindersEnabled() {
        return calendarRemindersEnabled;
    }

    public void setCalendarRemindersEnabled(Boolean calendarRemindersEnabled) {
        this.calendarRemindersEnabled = calendarRemindersEnabled;
    }

    public Integer getReminderLeadTimeMins() {
        return reminderLeadTimeMins;
    }

    public void setReminderLeadTimeMins(Integer reminderLeadTimeMins) {
        this.reminderLeadTimeMins = reminderLeadTimeMins;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }
}
