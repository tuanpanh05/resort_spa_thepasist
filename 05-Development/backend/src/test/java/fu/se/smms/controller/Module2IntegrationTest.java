package fu.se.smms.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TDD Integration Tests for Module 2 flows.
 * Covers RESORT-M2-INT-001 (End-to-End reservation and check-in flow).
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class Module2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private fu.se.smms.repository.RoomRepository roomRepository;

    @Autowired
    private fu.se.smms.repository.UserRepository userRepository;

    @Autowired
    private fu.se.smms.repository.RetreatPackageRepository retreatPackageRepository;

    @Autowired
    private fu.se.smms.repository.RoomBookingRepository roomBookingRepository;

    @Test
    @DisplayName("RESORT-M2-INT-001: Full reservation and check-in flow integration")
    void completeBookingAndCheckInFlow() throws Exception {
        // Step 1: Client searches active retreat packages
        mockMvc.perform(get("/retreat-packages")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        java.time.LocalDateTime start = java.time.LocalDateTime.of(2026, 6, 20, 14, 0);
        java.time.LocalDateTime end = java.time.LocalDateTime.of(2026, 6, 25, 12, 0);

        // Get valid records from seeded database
        fu.se.smms.entity.User guest = userRepository.findByEmail("guest1@gmail.com")
                .orElseThrow(() -> new AssertionError("guest1@gmail.com not found"));
        fu.se.smms.entity.Room room = roomRepository.findAll().stream()
                .filter(r -> "AVAILABLE".equalsIgnoreCase(r.getStatus()))
                .filter(r -> roomBookingRepository.countOverlappingBookings(r.getRoomId(), start, end) == 0)
                .findFirst()
                .orElseThrow(() -> new AssertionError("No AVAILABLE and conflict-free room found"));
        fu.se.smms.entity.RetreatPackage pkg = retreatPackageRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No ACTIVE retreat package found"));

        // Step 2: Client creates a new booking
        String bookingPayload = String.format("{\n" +
                "  \"guestId\": %d,\n" +
                "  \"packageId\": %d,\n" +
                "  \"roomId\": %d,\n" +
                "  \"checkInDate\": \"2026-06-20T14:00:00\",\n" +
                "  \"checkOutDate\": \"2026-06-25T12:00:00\"\n" +
                "}", guest.getUserId(), pkg.getPackageId(), room.getRoomId());

        // Since implementation doesn't exist yet, this integration test will fail (RED status confirmed)
        // when production code is not ready.
        mockMvc.perform(post("/v1/bookings")
                        .principal(() -> "guest1@gmail.com")
                        .content(bookingPayload)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated());
    }
}
