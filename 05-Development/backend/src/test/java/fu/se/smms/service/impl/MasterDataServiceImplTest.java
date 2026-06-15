package fu.se.smms.service.impl;

import fu.se.smms.dto.RetreatPackageDTO;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.repository.RetreatPackageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MasterDataServiceImpl.
 * Covers RESORT-M2-TC-001 (Filter Retreat Packages by active status).
 */
class MasterDataServiceImplTest {

    private RetreatPackageRepository retreatPackageRepository;
    private MasterDataServiceImpl masterDataService;

    @BeforeEach
    void setUp() {
        retreatPackageRepository = mock(RetreatPackageRepository.class);
        masterDataService = new MasterDataServiceImpl();
        ReflectionTestUtils.setField(masterDataService, "retreatPackageRepository", retreatPackageRepository);
    }

    @Test
    @DisplayName("RESORT-M2-TC-001: Successfully retrieve active retreat packages")
    void getActiveRetreatPackages_filtersOutInactivePackages() {
        // Arrange
        RetreatPackage packageActive = new RetreatPackage();
        packageActive.setPackageId(1);
        packageActive.setName("Yoga Detox");
        packageActive.setStatus("ACTIVE");
        packageActive.setPrice(new BigDecimal("5000000.00"));
        packageActive.setDurationDays(5);

        when(retreatPackageRepository.findByStatus("ACTIVE"))
                .thenReturn(Arrays.asList(packageActive));

        // Act
        List<RetreatPackageDTO> activePackages = masterDataService.getActiveRetreatPackages();

        // Assert
        assertNotNull(activePackages);
        assertEquals(1, activePackages.size());
        assertEquals("Yoga Detox", activePackages.get(0).getName());
        assertEquals("ACTIVE", activePackages.get(0).getStatus());

        verify(retreatPackageRepository, times(1)).findByStatus("ACTIVE");
    }

    @Test
    @DisplayName("RESORT-M2-TC-001: Return empty list if no active packages exist")
    void getActiveRetreatPackages_noActivePackages_returnsEmptyList() {
        // Arrange
        when(retreatPackageRepository.findByStatus("ACTIVE"))
                .thenReturn(Collections.emptyList());

        // Act
        List<RetreatPackageDTO> activePackages = masterDataService.getActiveRetreatPackages();

        // Assert
        assertNotNull(activePackages);
        assertTrue(activePackages.isEmpty());

        verify(retreatPackageRepository, times(1)).findByStatus("ACTIVE");
    }
}
