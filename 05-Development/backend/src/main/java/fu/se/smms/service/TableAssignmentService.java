package fu.se.smms.service;

import fu.se.smms.entity.RestaurantTable;
import fu.se.smms.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableAssignmentService {

    private final RestaurantTableRepository restaurantTableRepository;

    @Transactional
    public RestaurantTable assignTable(int guestCount) {
        List<RestaurantTable> availableTables = restaurantTableRepository
                .findByStatusAndCapacityGreaterThanEqualOrderByCapacityAsc("AVAILABLE", guestCount);
        
        if (availableTables.isEmpty()) {
            // Fallback: Just return any available table if possible, or null
            List<RestaurantTable> anyAvailable = restaurantTableRepository.findByStatus("AVAILABLE");
            if (anyAvailable.isEmpty()) return null;
            RestaurantTable assigned = anyAvailable.get(0);
            assigned.setStatus("OCCUPIED");
            restaurantTableRepository.save(assigned);
            return assigned;
        }
        
        RestaurantTable assigned = availableTables.get(0);
        assigned.setStatus("OCCUPIED");
        restaurantTableRepository.save(assigned);
        return assigned;
    }

    @Transactional
    public void freeTable(Integer tableId) {
        if (tableId == null) return;
        restaurantTableRepository.findById(tableId).ifPresent(t -> {
            t.setStatus("AVAILABLE");
            restaurantTableRepository.save(t);
        });
    }
}
