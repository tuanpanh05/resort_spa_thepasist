package fu.se.smms.controller;

import fu.se.smms.dto.*;
import fu.se.smms.service.MasterDataService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UC04 – Master Data Management Controller.
 * Read endpoints are public; write endpoints require ADMIN role.
 */
@RestController
public class MasterDataController {

    @Autowired
    private MasterDataService masterDataService;

    // ============================================================
    // SPA SERVICES – Public read, Admin write
    // ============================================================

    @GetMapping("/spa-services")
    public ResponseEntity<List<SpaServiceDTO>> getActiveSpaServices() {
        return ResponseEntity.ok(masterDataService.getActiveSpaServices());
    }

    @GetMapping("/admin/spa-services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpaServiceDTO>> getAllSpaServices() {
        return ResponseEntity.ok(masterDataService.getAllSpaServices());
    }

    @GetMapping("/admin/spa-services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaServiceDTO> getSpaServiceById(@PathVariable Integer id) {
        return ResponseEntity.ok(masterDataService.getSpaServiceById(id));
    }

    @PostMapping("/admin/spa-services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSpaService(@Valid @RequestBody SpaServiceDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.createSpaService(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/admin/spa-services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSpaService(@PathVariable Integer id, @Valid @RequestBody SpaServiceDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.updateSpaService(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/spa-services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSpaService(@PathVariable Integer id) {
        try {
            masterDataService.deleteSpaService(id);
            return ResponseEntity.ok(Map.of("message", "Dịch vụ Spa đã được xóa thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ============================================================
    // RETREAT PACKAGES – Public read, Admin write
    // ============================================================

    @GetMapping("/retreat-packages")
    public ResponseEntity<List<RetreatPackageDTO>> getActiveRetreatPackages() {
        return ResponseEntity.ok(masterDataService.getActiveRetreatPackages());
    }

    @GetMapping("/admin/retreat-packages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RetreatPackageDTO>> getAllRetreatPackages() {
        return ResponseEntity.ok(masterDataService.getAllRetreatPackages());
    }

    @PostMapping("/admin/retreat-packages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRetreatPackage(@Valid @RequestBody RetreatPackageDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.createRetreatPackage(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/admin/retreat-packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRetreatPackage(@PathVariable Integer id, @Valid @RequestBody RetreatPackageDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.updateRetreatPackage(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/retreat-packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRetreatPackage(@PathVariable Integer id) {
        try {
            masterDataService.deleteRetreatPackage(id);
            return ResponseEntity.ok(Map.of("message", "Gói Retreat đã được xóa thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ============================================================
    // ROOM TYPES – Public read, Admin write
    // ============================================================

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeDTO>> getAllRoomTypes() {
        return ResponseEntity.ok(masterDataService.getAllRoomTypes());
    }

    @PostMapping("/admin/room-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRoomType(@Valid @RequestBody RoomTypeDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.createRoomType(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/admin/room-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRoomType(@PathVariable Integer id, @Valid @RequestBody RoomTypeDTO dto) {
        try {
            return ResponseEntity.ok(masterDataService.updateRoomType(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/room-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRoomType(@PathVariable Integer id) {
        try {
            masterDataService.deleteRoomType(id);
            return ResponseEntity.ok(Map.of("message", "Loại phòng đã được xóa thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
