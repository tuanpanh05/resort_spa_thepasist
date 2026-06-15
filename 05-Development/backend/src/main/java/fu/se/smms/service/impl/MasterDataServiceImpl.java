package fu.se.smms.service.impl;

import fu.se.smms.dto.*;
import fu.se.smms.entity.RetreatPackage;
import fu.se.smms.entity.RoomType;
import fu.se.smms.entity.SpaService;
import fu.se.smms.repository.RetreatPackageRepository;
import fu.se.smms.repository.RoomTypeRepository;
import fu.se.smms.repository.SpaServiceRepository;
import fu.se.smms.service.MasterDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MasterDataServiceImpl implements MasterDataService {

    @Autowired private SpaServiceRepository spaServiceRepository;
    @Autowired private RetreatPackageRepository retreatPackageRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;

    // ========== SPA SERVICES ==========
    @Override @Transactional(readOnly = true)
    public List<SpaServiceDTO> getAllSpaServices() {
        return spaServiceRepository.findAll().stream().map(this::toSpaDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<SpaServiceDTO> getActiveSpaServices() {
        return spaServiceRepository.findByStatus("ACTIVE").stream().map(this::toSpaDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public SpaServiceDTO getSpaServiceById(Integer id) {
        return toSpaDTO(spaServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spa service not found with id: " + id)));
    }

    @Override
    public SpaServiceDTO createSpaService(SpaServiceDTO dto) {
        SpaService entity = new SpaService();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setDurationMinutes(dto.getDurationMinutes());
        entity.setPrice(dto.getPrice());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        return toSpaDTO(spaServiceRepository.save(entity));
    }

    @Override
    public SpaServiceDTO updateSpaService(Integer id, SpaServiceDTO dto) {
        SpaService entity = spaServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spa service not found with id: " + id));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setDurationMinutes(dto.getDurationMinutes());
        entity.setPrice(dto.getPrice());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return toSpaDTO(spaServiceRepository.save(entity));
    }

    @Override
    public void deleteSpaService(Integer id) {
        if (!spaServiceRepository.existsById(id))
            throw new RuntimeException("Spa service not found with id: " + id);
        spaServiceRepository.deleteById(id);
    }

    // ========== RETREAT PACKAGES ==========
    @Override @Transactional(readOnly = true)
    public List<RetreatPackageDTO> getAllRetreatPackages() {
        return retreatPackageRepository.findAll().stream().map(this::toPackageDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<RetreatPackageDTO> getActiveRetreatPackages() {
        return retreatPackageRepository.findByStatus("ACTIVE").stream().map(this::toPackageDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public RetreatPackageDTO getRetreatPackageById(Integer id) {
        return toPackageDTO(retreatPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retreat package not found with id: " + id)));
    }

    /**
     * UC6 – Filter packages (BR-04: only ACTIVE packages).
     * Keyword search is safe against SQL Injection via JPQL parameterized query.
     */
    @Override @Transactional(readOnly = true)
    public List<RetreatPackageDTO> filterPackages(PackageFilterRequest filter) {
        String keyword    = (filter != null && StringUtils.hasText(filter.getKeyword()))
                            ? filter.getKeyword().trim().toLowerCase() : null;
        String healthGoal = (filter != null && StringUtils.hasText(filter.getHealthGoal()))
                            ? filter.getHealthGoal().toUpperCase().trim() : null;

        List<RetreatPackage> activeList = retreatPackageRepository.findByStatus("ACTIVE");

        return activeList.stream()
                .map(this::toPackageDTO)
                .filter(dto -> {
                    if (healthGoal != null && !healthGoal.equals(dto.getHealthGoal())) {
                        return false;
                    }
                    if (keyword != null) {
                        String name = dto.getName() != null ? dto.getName().toLowerCase() : "";
                        String desc = dto.getDescription() != null ? dto.getDescription().toLowerCase() : "";
                        if (!name.contains(keyword) && !desc.contains(keyword)) {
                            return false;
                        }
                    }
                    if (filter != null) {
                        if (filter.getMinPrice() != null && dto.getPrice() != null && dto.getPrice().compareTo(filter.getMinPrice()) < 0) {
                            return false;
                        }
                        if (filter.getMaxPrice() != null && dto.getPrice() != null && dto.getPrice().compareTo(filter.getMaxPrice()) > 0) {
                            return false;
                        }
                        if (filter.getMaxDurationDays() != null && dto.getDurationDays() != null && dto.getDurationDays() > filter.getMaxDurationDays()) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if (a.getPrice() == null) return 1;
                    if (b.getPrice() == null) return -1;
                    return a.getPrice().compareTo(b.getPrice());
                })
                .collect(Collectors.toList());
    }

    @Override
    public RetreatPackageDTO createRetreatPackage(RetreatPackageDTO dto) {
        RetreatPackage entity = new RetreatPackage();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDurationDays(dto.getDurationDays());
        entity.setPrice(dto.getPrice());
        entity.setIncludes(dto.getIncludes());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        return toPackageDTO(retreatPackageRepository.save(entity));
    }

    @Override
    public RetreatPackageDTO updateRetreatPackage(Integer id, RetreatPackageDTO dto) {
        RetreatPackage entity = retreatPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retreat package not found with id: " + id));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDurationDays(dto.getDurationDays());
        entity.setPrice(dto.getPrice());
        entity.setIncludes(dto.getIncludes());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return toPackageDTO(retreatPackageRepository.save(entity));
    }

    @Override
    public void deleteRetreatPackage(Integer id) {
        if (!retreatPackageRepository.existsById(id))
            throw new RuntimeException("Retreat package not found with id: " + id);
        retreatPackageRepository.deleteById(id);
    }

    // ========== ROOM TYPES ==========
    @Override @Transactional(readOnly = true)
    public List<RoomTypeDTO> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream().map(this::toRoomTypeDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public RoomTypeDTO getRoomTypeById(Integer id) {
        return toRoomTypeDTO(roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found with id: " + id)));
    }

    @Override
    public RoomTypeDTO createRoomType(RoomTypeDTO dto) {
        RoomType entity = new RoomType();
        entity.setTypeName(dto.getTypeName());
        entity.setDescription(dto.getDescription());
        entity.setBasePricePerNight(dto.getBasePricePerNight());
        entity.setMaxOccupancy(dto.getMaxOccupancy());
        entity.setAreaSqm(dto.getAreaSqm());
        return toRoomTypeDTO(roomTypeRepository.save(entity));
    }

    @Override
    public RoomTypeDTO updateRoomType(Integer id, RoomTypeDTO dto) {
        RoomType entity = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found with id: " + id));
        entity.setTypeName(dto.getTypeName());
        entity.setDescription(dto.getDescription());
        entity.setBasePricePerNight(dto.getBasePricePerNight());
        entity.setMaxOccupancy(dto.getMaxOccupancy());
        entity.setAreaSqm(dto.getAreaSqm());
        return toRoomTypeDTO(roomTypeRepository.save(entity));
    }

    @Override
    public void deleteRoomType(Integer id) {
        if (!roomTypeRepository.existsById(id))
            throw new RuntimeException("Room type not found with id: " + id);
        roomTypeRepository.deleteById(id);
    }

    // ========== Mapper Helpers ==========
    private SpaServiceDTO toSpaDTO(SpaService e) {
        SpaServiceDTO dto = new SpaServiceDTO();
        dto.setServiceId(e.getServiceId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        dto.setCategory(e.getCategory());
        dto.setDurationMinutes(e.getDurationMinutes());
        dto.setPrice(e.getPrice());
        dto.setStatus(e.getStatus());

        String lowerName = e.getName() != null ? e.getName().toLowerCase() : "";
        if (lowerName.contains("volcanic") || lowerName.contains("đá núi lửa") || lowerName.contains("stone")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Giảm đau mỏi cơ khớp;Thư giãn sâu;Tăng cường tuần hoàn;Đào thải độc tố cơ thể");
        } else if (lowerName.contains("dao red") || lowerName.contains("dao đỏ") || lowerName.contains("herbal bath")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Lưu thông khí huyết;Thư giãn dễ ngủ;Hỗ trợ xương khớp;Làm sáng mịn da");
        } else if (lowerName.contains("spinal") || lowerName.contains("nắn chỉnh") || lowerName.contains("cột sống")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Nắn chỉnh cột sống;Giảm chèn ép dây thần kinh;Hết đau mỏi lưng;Tăng tầm vận động");
        } else if (lowerName.contains("bowl") || lowerName.contains("chuông xoay")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Xoa dịu thần kinh;Giảm stress lo âu;Cân bằng luân xa;Cải thiện giấc ngủ");
        } else if (lowerName.contains("detox wrap") || lowerName.contains("thải độc thảo mộc")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Đào thải độc tố da;Tăng tuần hoàn máu;Làm sáng mịn da;Thư giãn sâu");
        } else if (lowerName.contains("cổ vai gáy") || lowerName.contains("shoulder")) {
            dto.setImageUrl("https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Giảm đau vai gáy;Tăng tuần hoàn não;Hết đau đầu chóng mặt;Phục hồi cơ bắp");
        } else {
            dto.setImageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80");
            dto.setBenefits("Thư giãn cơ bắp;Tăng cường thể trạng;Phục hồi sinh khí");
        }
        return dto;
    }

    private RetreatPackageDTO toPackageDTO(RetreatPackage e) {
        RetreatPackageDTO dto = new RetreatPackageDTO();
        dto.setPackageId(e.getPackageId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        dto.setDurationDays(e.getDurationDays());
        dto.setPrice(e.getPrice());
        dto.setIncludes(e.getIncludes());
        dto.setStatus(e.getStatus());
        dto.setCreatedAt(e.getCreatedAt());

        String lowerName = e.getName() != null ? e.getName().toLowerCase() : "";
        if (lowerName.contains("detox")) {
            dto.setHealthGoal("DETOX");
            dto.setImageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80");
            dto.setMaxGuests(2);
        } else if (lowerName.contains("yoga") || lowerName.contains("mindfulness")) {
            dto.setHealthGoal("YOGA");
            dto.setImageUrl("https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80");
            dto.setMaxGuests(2);
        } else if (lowerName.contains("slim") || lowerName.contains("weight") || lowerName.contains("béo")) {
            dto.setHealthGoal("WEIGHT_LOSS");
            dto.setImageUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80");
            dto.setMaxGuests(2);
        } else if (lowerName.contains("stress") || lowerName.contains("de-stress") || lowerName.contains("thư giãn")) {
            dto.setHealthGoal("STRESS_RELIEF");
            dto.setImageUrl("https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&w=800&q=80");
            dto.setMaxGuests(1);
        } else {
            dto.setHealthGoal("GENERAL");
            dto.setImageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80");
            dto.setMaxGuests(2);
        }
        return dto;
    }

    private RoomTypeDTO toRoomTypeDTO(RoomType e) {
        RoomTypeDTO dto = new RoomTypeDTO();
        dto.setRoomTypeId(e.getRoomTypeId());
        dto.setTypeName(e.getTypeName());
        dto.setDescription(e.getDescription());
        dto.setBasePricePerNight(e.getBasePricePerNight());
        dto.setMaxOccupancy(e.getMaxOccupancy());
        dto.setAreaSqm(e.getAreaSqm());
        return dto;
    }
}
