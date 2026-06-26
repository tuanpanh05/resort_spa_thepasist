package fu.se.smms.service;

import fu.se.smms.dto.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface SpaBookingService {

    AutoMatchResponseDTO autoMatch(Integer spaServiceId, LocalDateTime startDatetime);

    SpaBookingResponseDTO scheduleSpaBooking(Integer userId, SpaBookingRequestDTO request, String currentUserRole);

    List<SpecialistSpaAppointmentDTO> getTherapistSchedule(Integer therapistId, LocalDate date);

    List<SpecialistSpaAppointmentDTO> getTherapistScheduleRange(Integer therapistId, LocalDate start, LocalDate end);

    SpaBookingResponseDTO updateSessionStatus(Integer spaBookingId, String status, Integer therapistId);

    SpaBookingResponseDTO cancelSpaBooking(Integer spaBookingId, String reason);
}
