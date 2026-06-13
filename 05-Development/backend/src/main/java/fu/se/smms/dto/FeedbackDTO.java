package fu.se.smms.dto;

import java.time.LocalDateTime;

/**
 * DTO for UC23: Submit Review & Rating.
 * Contains request fields (rating, comment) and response fields.
 */
public class FeedbackDTO {
    private Integer feedbackId;
    private Integer userId;
    private String userFullName;
    private Integer bookingId;
    private Integer rating;
    private String comment;
    private Boolean isToxic;
    private LocalDateTime createdAt;

    // === Getters & Setters ===

    public Integer getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Integer feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Boolean getIsToxic() {
        return isToxic;
    }

    public void setIsToxic(Boolean isToxic) {
        this.isToxic = isToxic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
