package fu.se.smms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user; // nullable

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "content", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Open";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "feedback", columnDefinition = "NVARCHAR(MAX)")
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User assignedStaff;

    @Column(name = "assigned_staff_name", columnDefinition = "NVARCHAR(255)")
    private String assignedStaffName;

    @Column(name = "assigned_staff_phone", length = 50)
    private String assignedStaffPhone;


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "Open";
        }
    }

    public Complaint() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public User getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(User assignedStaff) {
        this.assignedStaff = assignedStaff;
    }

    public String getAssignedStaffName() {
        return assignedStaffName;
    }

    public void setAssignedStaffName(String assignedStaffName) {
        this.assignedStaffName = assignedStaffName;
    }

    public String getAssignedStaffPhone() {
        return assignedStaffPhone;
    }

    public void setAssignedStaffPhone(String assignedStaffPhone) {
        this.assignedStaffPhone = assignedStaffPhone;
    }

    @Transient
    public Integer getUserId() {
        return user != null ? user.getUserId() : null;
    }

    @Transient
    public Integer getAssignedStaffId() {
        return assignedStaff != null ? assignedStaff.getUserId() : null;
    }
}
