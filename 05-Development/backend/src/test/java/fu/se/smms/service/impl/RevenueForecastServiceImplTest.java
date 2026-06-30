package fu.se.smms.service.impl;

import fu.se.smms.dto.RevenueForecastDTO;
import fu.se.smms.repository.InvoiceRepository;
import fu.se.smms.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for Revenue Forecasting - Module 5 (UC24-25).
 * Verifies calculation accuracy of statistical forecasting and empty DB fallbacks.
 */
class RevenueForecastServiceImplTest {

    private InvoiceRepository invoiceRepository;
    private RoomRepository roomRepository;
    private RevenueServiceImpl service;

    @BeforeEach
    void setUp() {
        invoiceRepository = mock(InvoiceRepository.class);
        roomRepository = mock(RoomRepository.class);
        service = new RevenueServiceImpl(invoiceRepository, roomRepository);
    }

    @Test
    @DisplayName("REV-TC-01: getRevenueForecast calculates future months correctly using linear regression when offline")
    void getRevenueForecast_calculatesSuccessfully_withMockHistory() {
        // Arrange
        int currentYear = java.time.LocalDate.now().getYear();

        List<Object[]> prevYearData = new ArrayList<>();
        // Add 12 months for prev year
        for (int m = 1; m <= 12; m++) {
            prevYearData.add(new Object[]{m, new BigDecimal(10000000 + m * 500000), new BigDecimal(4000000 + m * 200000), new BigDecimal(2000000 + m * 100000)});
        }

        List<Object[]> currYearData = new ArrayList<>();
        // Add current year months up to current month (e.g. June)
        int currentMonth = java.time.LocalDate.now().getMonthValue();
        for (int m = 1; m <= currentMonth; m++) {
            currYearData.add(new Object[]{m, new BigDecimal(16000000 + m * 600000), new BigDecimal(6400000 + m * 240000), new BigDecimal(3200000 + m * 120000)});
        }

        when(invoiceRepository.findMonthlyRevenueBreakdown(currentYear - 1)).thenReturn(prevYearData);
        when(invoiceRepository.findMonthlyRevenueBreakdown(currentYear)).thenReturn(currYearData);

        // Act
        RevenueForecastDTO dto = service.getRevenueForecast(3);

        // Assert
        assertNotNull(dto);
        assertEquals(3, dto.getForecastData().size());
        assertNotNull(dto.getAiAnalysis());
        assertTrue(dto.getMethodUsed().contains("Linear Regression"));

        // Verify forecasted month labels
        int nextM = currentMonth;
        int nextY = currentYear;
        for (int i = 0; i < 3; i++) {
            nextM++;
            if (nextM > 12) {
                nextM = 1;
                nextY++;
            }
            String expectedLabel = String.format("Tháng %02d/%d", nextM, nextY);
            assertEquals(expectedLabel, dto.getForecastData().get(i).getLabel());
            assertTrue(dto.getForecastData().get(i).getTotalRevenue().compareTo(BigDecimal.ZERO) >= 0);
        }
    }

    @Test
    @DisplayName("REV-TC-02: getRevenueForecast supplies fallback mock data when database is completely empty")
    void getRevenueForecast_fallbackToMockData_whenDatabaseIsEmpty() {
        // Arrange
        int currentYear = java.time.LocalDate.now().getYear();
        when(invoiceRepository.findMonthlyRevenueBreakdown(anyInt())).thenReturn(new ArrayList<>());

        // Act
        RevenueForecastDTO dto = service.getRevenueForecast(6);

        // Assert
        assertNotNull(dto);
        assertEquals(6, dto.getForecastData().size());
        assertNotNull(dto.getAiAnalysis());
        assertTrue(dto.getMethodUsed().contains("Linear Regression"));
    }
}
