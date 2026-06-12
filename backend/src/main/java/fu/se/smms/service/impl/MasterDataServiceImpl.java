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
