package fu.se.smms.service;

import fu.se.smms.entity.FoodOrder;
import fu.se.smms.entity.RestaurantTable;
import fu.se.smms.repository.FoodOrderRepository;
import fu.se.smms.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableAssignmentService {
    private final RestaurantTableRepository restaurantTableRepository;
    private final FoodOrderRepository foodOrderRepository;

    @Transactional
    public RestaurantTable assignTable(int guestCount, LocalDateTime targetTime) {
        List<RestaurantTable> allTables = restaurantTableRepository.findAll();
        allTables.sort((a, b) -> Integer.compare(a.getCapacity(), b.getCapacity()));

        List<RestaurantTable> suitableTables = allTables.stream()
                .filter(t -> t.getCapacity() >= guestCount)
                .collect(Collectors.toList());

        if (suitableTables.isEmpty()) {
            suitableTables = allTables; // fallback
        }

        LocalDate targetDate = targetTime != null ? targetTime.toLocalDate() : LocalDate.now();

        List<FoodOrder> ordersOnDate = foodOrderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && o.getOrderTime().toLocalDate().equals(targetDate))
                .filter(o -> !"CANCELLED".equals(o.getStatus()) && !"COMPLETED".equals(o.getStatus()))
                .collect(Collectors.toList());

        Set<Integer> occupiedTableIds = ordersOnDate.stream()
                .filter(o -> o.getTable() != null)
                .map(o -> o.getTable().getTableId())
                .collect(Collectors.toSet());

        RestaurantTable assigned = null;
        for (RestaurantTable t : suitableTables) {
            if (!occupiedTableIds.contains(t.getTableId())) {
                assigned = t;
                break;
            }
        }

        if (assigned == null) {
            if (suitableTables.isEmpty()) return null;
            assigned = suitableTables.get(0);
        }

        // Only lock the physical table if the booking is for right now
        if (targetTime == null || targetTime.toLocalDate().equals(LocalDate.now())) {
            assigned.setStatus("OCCUPIED");
            restaurantTableRepository.save(assigned);
        }

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

    @Transactional
    public void assignTableForBooking(Integer bookingId, int guestCount) {
        if (bookingId == null) return;

        List<FoodOrder> bookingOrders = foodOrderRepository.findAll().stream()
                .filter(o -> o.getRoomBooking() != null && o.getRoomBooking().getBookingId().equals(bookingId))
                .filter(o -> "PENDING".equals(o.getStatus()) && o.getTable() == null)
                .collect(Collectors.toList());

        if (bookingOrders.isEmpty()) return;

        Set<LocalDate> targetDates = bookingOrders.stream()
                .filter(o -> o.getOrderTime() != null)
                .map(o -> o.getOrderTime().toLocalDate())
                .collect(Collectors.toSet());

        if (targetDates.isEmpty()) return;

        List<RestaurantTable> allTables = restaurantTableRepository.findAll();
        allTables.sort((a, b) -> Integer.compare(a.getCapacity(), b.getCapacity()));

        List<RestaurantTable> suitableTables = allTables.stream()
                .filter(t -> t.getCapacity() >= guestCount)
                .collect(Collectors.toList());

        if (suitableTables.isEmpty()) {
            suitableTables = allTables; // fallback
        }

        // Find orders on any of the target dates
        List<FoodOrder> otherOrdersOnDates = foodOrderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && targetDates.contains(o.getOrderTime().toLocalDate()))
                .filter(o -> !"CANCELLED".equals(o.getStatus()) && !"COMPLETED".equals(o.getStatus()))
                .filter(o -> o.getTable() != null)
                .collect(Collectors.toList());

        Set<Integer> occupiedTableIds = otherOrdersOnDates.stream()
                .map(o -> o.getTable().getTableId())
                .collect(Collectors.toSet());

        RestaurantTable assigned = null;
        for (RestaurantTable t : suitableTables) {
            if (!occupiedTableIds.contains(t.getTableId())) {
                assigned = t;
                break;
            }
        }

        if (assigned == null) {
            if (suitableTables.isEmpty()) return;
            assigned = suitableTables.get(0);
        }

        for (FoodOrder order : bookingOrders) {
            order.setTable(assigned);
            foodOrderRepository.save(order);
        }

        if (targetDates.contains(LocalDate.now())) {
            assigned.setStatus("OCCUPIED");
            restaurantTableRepository.save(assigned);
        }
    }
}
