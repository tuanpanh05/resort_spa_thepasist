package fu.se.smms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.smms.config.JwtFilter;
import fu.se.smms.config.SecurityConfig;
import fu.se.smms.dto.MedicalProfileDTO;
import fu.se.smms.service.MedicalProfileService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = MedicalProfileController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
        }
)
public class MedicalProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MedicalProfileService medicalProfileService;

    // Helper to mock principal
    private Principal mockPrincipal(String email) {
        return () -> email;
    }

    @Test
    public void testGetMyMedicalProfile_Success() throws Exception {
        MedicalProfileDTO mockProfile = MedicalProfileDTO.builder()
                .userId(1)
                .userFullName("Test User")
                .physicalCondition("No issues")
                .foodAllergies("Peanuts")
                .explicitConsentSigned(true)
                .build();

        Mockito.when(medicalProfileService.getMyMedicalProfile("test@example.com"))
                .thenReturn(mockProfile);

        mockMvc.perform(get("/medical-profiles/me")
                .principal(mockPrincipal("test@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.physicalCondition").value("No issues"))
                .andExpect(jsonPath("$.foodAllergies").value("Peanuts"))
                .andExpect(jsonPath("$.explicitConsentSigned").value(true));
    }

    @Test
    public void testCreateOrUpdateMyMedicalProfile_Success() throws Exception {
        MedicalProfileDTO requestDto = MedicalProfileDTO.builder()
                .physicalCondition("Healthy")
                .foodAllergies("None")
                .explicitConsentSigned(true)
                .build();

        MedicalProfileDTO responseDto = MedicalProfileDTO.builder()
                .userId(1)
                .userFullName("Test User")
                .physicalCondition("Healthy")
                .foodAllergies("None")
                .explicitConsentSigned(true)
                .build();

        Mockito.when(medicalProfileService.createOrUpdateMedicalProfile(eq("test@example.com"), any(MedicalProfileDTO.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/medical-profiles/me")
                .principal(mockPrincipal("test@example.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.physicalCondition").value("Healthy"));
    }

    @Test
    public void testDeleteMyMedicalProfile_Success() throws Exception {
        Mockito.doNothing().when(medicalProfileService).deleteMedicalProfile("test@example.com");

        mockMvc.perform(delete("/medical-profiles/me")
                .principal(mockPrincipal("test@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }
}
