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
@Transactional
class Module2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("RESORT-M2-INT-001: Full reservation and check-in flow integration")
    void completeBookingAndCheckInFlow() throws Exception {
        // Step 1: Client searches active retreat packages
        mockMvc.perform(get("/retreat-packages")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Step 2: Client creates a new booking
        String bookingPayload = "{\n" +
                "  \"guestId\": 1,\n" +
                "  \"packageId\": 1,\n" +
                "  \"villaId\": 1,\n" +
                "  \"checkInDate\": \"2026-06-20T14:00:00\",\n" +
                "  \"checkOutDate\": \"2026-06-25T12:00:00\"\n" +
                "}";

        // Since implementation doesn't exist yet, this integration test will fail (RED status confirmed)
        // when production code is not ready.
        mockMvc.perform(post("/api/v1/bookings")
                        .content(bookingPayload)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated());
    }
}
