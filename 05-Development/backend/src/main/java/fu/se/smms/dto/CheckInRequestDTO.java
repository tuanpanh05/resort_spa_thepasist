package fu.se.smms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for UC08 Check-In request.
 * Receptionist submits this to perform guest check-in.
 * Requires identity document (CCCD/Passport) per Vietnamese Residence Law 2020.
 */
public class CheckInRequestDTO {

    @NotNull(message = "Mã đặt phòng là bắt buộc.")
    private Integer bookingId;

    @NotBlank(message = "Số CCCD / Hộ chiếu là bắt buộc (Luật Cư trú 2020).")
    private String identityDocument;

    @NotBlank(message = "Quốc tịch là bắt buộc.")
    private String nationality;

    private java.util.List<AccompanyingGuestDTO> accompanyingGuests;

    public CheckInRequestDTO() {}

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public String getIdentityDocument() { return identityDocument; }
    public void setIdentityDocument(String identityDocument) { this.identityDocument = identityDocument; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public java.util.List<AccompanyingGuestDTO> getAccompanyingGuests() { return accompanyingGuests; }
    public void setAccompanyingGuests(java.util.List<AccompanyingGuestDTO> accompanyingGuests) { this.accompanyingGuests = accompanyingGuests; }
}
