package fu.se.smms.dto;

import jakarta.validation.constraints.NotBlank;

public class UserProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    private String idPassport;

    private Boolean googleCalendarSyncEnabled;
    private String googleCalendarId;
    private Boolean calendarRemindersEnabled;
    private Integer reminderLeadTimeMins;

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
}
