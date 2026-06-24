package fu.se.smms.controller;

import fu.se.smms.entity.Inventory;
import fu.se.smms.repository.InventoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    public InventoryController(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventoryItem(@RequestBody Inventory item) {
        if (item.getId() == null || item.getId().isEmpty()) {
            item.setId("INV-" + (int)(100 + Math.random() * 900));
        }
        return ResponseEntity.ok(inventoryRepository.save(item));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Inventory> updateStock(@PathVariable String id, @RequestParam Integer delta) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    int newStock = Math.max(0, item.getStock() + delta);
                    item.setStock(newStock);
                    return ResponseEntity.ok(inventoryRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
