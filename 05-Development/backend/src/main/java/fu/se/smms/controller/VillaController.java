package fu.se.smms.controller;

import fu.se.smms.dto.VillaStatusDTO;
import fu.se.smms.entity.Room;
import fu.se.smms.exception.BusinessException;
import fu.se.smms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for UC09: Manage Villa Status.
 *
 * Endpoints:
 *   GET   /v1/villas             — List all rooms with status and type info
 *   PATCH /v1/villas/{id}/status — Update room status (RECEPTIONIST, HOUSEKEEPER, ADMIN)
 *
 * Authorization: Authenticated users.
 * ADR-003: Supports VACANT_NEEDS_CLEANING → AVAILABLE transition for housekeeping workflow.
 */
@RestController
@RequestMapping("/v1/villas")
public class VillaController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private fu.se.smms.repository.RoomBookingRepository roomBookingRepository;

    /**
     * Valid villa/room statuses per database CHECK constraint.
     */
    private static final List<String> VALID_STATUSES = Arrays.asList(
            "AVAILABLE", "OCCUPIED", "MAINTENANCE", "DIRTY", "CLEANING", "VACANT_NEEDS_CLEANING");

    /**
     * UC09: List all rooms with their current status, type, and capacity info.
     *
     * @return List of VillaStatusDTO objects.
     */
    @GetMapping
    public ResponseEntity<List<VillaStatusDTO>> getAllVillas() {
        List<Room> rooms = roomRepository.findAllWithRoomType();
        java.time.LocalDate today = java.time.LocalDate.now();
        List<VillaStatusDTO> villas = rooms.stream().map(room -> {
            VillaStatusDTO dto = new VillaStatusDTO();
            dto.setRoomId(room.getRoomId());
            dto.setRoomNumber(room.getRoomNumber());
            
            String status = room.getStatus();
            if ("AVAILABLE".equals(status) && roomBookingRepository.hasConfirmedBookingOnDate(room.getRoomId(), today) > 0) {
                status = "DEPOSITED";
            }
            dto.setStatus(status);
            
            if (room.getRoomType() != null) {
                dto.setRoomTypeName(room.getRoomType().getTypeName());
                dto.setCapacity(room.getRoomType().getMaxOccupancy());
                dto.setBasePrice(room.getRoomType().getBasePricePerNight());
            }
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(villas);
    }

    /**
     * UC09: Update the status of a specific room/villa.
     * Supports all transitions defined in ADR-003 state machine:
     *   AVAILABLE → OCCUPIED (via check-in), AVAILABLE → MAINTENANCE
     *   OCCUPIED → VACANT_NEEDS_CLEANING (via check-out)
     *   VACANT_NEEDS_CLEANING → AVAILABLE (via cleaning confirmation)
     *   MAINTENANCE → AVAILABLE
     *
     * @param id      The room ID.
     * @param body    JSON body containing "status" field.
     * @return Updated VillaStatusDTO.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<VillaStatusDTO> updateVillaStatus(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new BusinessException(
                    "VILLA-001", HttpStatus.BAD_REQUEST,
                    "Trạng thái mới không được để trống.");
        }

        String normalizedStatus = newStatus.toUpperCase().trim();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BusinessException(
                    "VILLA-002", HttpStatus.BAD_REQUEST,
                    "Trạng thái không hợp lệ: " + newStatus +
                    ". Các trạng thái cho phép: " + String.join(", ", VALID_STATUSES));
        }

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "VILLA-003", HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng với ID: " + id));

        room.setStatus(normalizedStatus);
        roomRepository.save(room);

        VillaStatusDTO dto = new VillaStatusDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setStatus(room.getStatus());
        if (room.getRoomType() != null) {
            dto.setRoomTypeName(room.getRoomType().getTypeName());
            dto.setCapacity(room.getRoomType().getMaxOccupancy());
            dto.setBasePrice(room.getRoomType().getBasePricePerNight());
        }

        return ResponseEntity.ok(dto);
    }
}
