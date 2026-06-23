package fu.se.smms.service;

import fu.se.smms.dto.*;
import java.util.List;

public interface MasterDataService {
    // Spa Services
    List<SpaServiceDTO> getAllSpaServices();
    List<SpaServiceDTO> getActiveSpaServices();
    SpaServiceDTO getSpaServiceById(Integer id);
    SpaServiceDTO createSpaService(SpaServiceDTO dto);
    SpaServiceDTO updateSpaService(Integer id, SpaServiceDTO dto);
    void deleteSpaService(Integer id);

    // Retreat Packages
    List<RetreatPackageDTO> getAllRetreatPackages();
    List<RetreatPackageDTO> getActiveRetreatPackages();
    RetreatPackageDTO getRetreatPackageById(Integer id);
    RetreatPackageDTO createRetreatPackage(RetreatPackageDTO dto);
    RetreatPackageDTO updateRetreatPackage(Integer id, RetreatPackageDTO dto);
    void deleteRetreatPackage(Integer id);

    /**
     * UC6 – Filter active retreat packages by optional criteria.
     * Implements BR-04: only ACTIVE packages are returned.
     *
     * @param filter contains keyword, healthGoal, minPrice, maxPrice, maxDurationDays
     * @return sorted list of matching packages
     */
    List<RetreatPackageDTO> filterPackages(PackageFilterRequest filter);

    // Room Types
    List<RoomTypeDTO> getAllRoomTypes(String checkIn, String checkOut);
    RoomTypeDTO getRoomTypeById(Integer id);
    RoomTypeDTO createRoomType(RoomTypeDTO dto);
    RoomTypeDTO updateRoomType(Integer id, RoomTypeDTO dto);
    void deleteRoomType(Integer id);
}
