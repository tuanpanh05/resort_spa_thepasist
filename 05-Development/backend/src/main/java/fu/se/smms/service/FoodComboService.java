package fu.se.smms.service;

import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodComboService {

    private final BookingDietRepository bookingDietRepository;
    private final ComboMenuTemplateRepository comboMenuTemplateRepository;
    private final DailyMealOrderRepository dailyMealOrderRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final FoodMenuRepository foodMenuRepository;

    public FoodComboService(BookingDietRepository bookingDietRepository,
                            ComboMenuTemplateRepository comboMenuTemplateRepository,
                            DailyMealOrderRepository dailyMealOrderRepository,
                            RoomBookingRepository roomBookingRepository,
                            FoodMenuRepository foodMenuRepository) {
        this.bookingDietRepository = bookingDietRepository;
        this.comboMenuTemplateRepository = comboMenuTemplateRepository;
        this.dailyMealOrderRepository = dailyMealOrderRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.foodMenuRepository = foodMenuRepository;
    }

    /**
     * Auto-generates the Family Style menu for a given booking on a specific date and meal.
     */
    @Transactional
    public List<DailyMealOrder> generateDefaultFamilyMenu(Integer bookingId, LocalDate serveDate, String mealType) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getPackageId() == null) {
            throw new RuntimeException("This booking does not include a food combo package");
        }

        // Calculate day number based on check-in date
        LocalDate checkInDate = booking.getCheckInDate().toLocalDate();
        long daysBetween = ChronoUnit.DAYS.between(checkInDate, serveDate);
        if (daysBetween < 0) {
            throw new IllegalArgumentException("Serve date cannot be before check-in date");
        }
        
        // 7-day rotating logic: day 8 becomes day 1
        int dayNumber = (int) (daysBetween % 7) + 1;

        // 1. Get Guest Count and Diet Ratios
        List<BookingDiet> diets = bookingDietRepository.findByRoomBooking_BookingId(bookingId);
        if (diets.isEmpty()) {
            throw new RuntimeException("No dietary profiles found for this booking. Please complete Health Profile.");
        }

        int totalGuests = diets.stream().mapToInt(BookingDiet::getGuestCount).sum();

        // 2. Get Available Menu Options for this Combo on this Day & Meal
        List<ComboMenuTemplate> menuTemplates = comboMenuTemplateRepository
                .findByRetreatPackage_PackageIdAndDayNumberAndMealType(booking.getPackageId(), dayNumber, mealType);

        if (menuTemplates.isEmpty()) {
            return new ArrayList<>(); // No menu configured
        }

        // 3. Auto-Allocation Algorithm
        List<DailyMealOrder> ordersToSave = new ArrayList<>();

        for (BookingDiet diet : diets) {
            int guestCountForDiet = diet.getGuestCount();
            
            // Filter options that match this diet (Assuming exact match for simplicity)
            // In a real scenario, you'd match dietary tags like 'Vegan' containing in foodMenu.getDietaryTags()
            List<ComboMenuTemplate> matchingOptions = menuTemplates.stream()
                    .filter(t -> t.getFoodMenu().getDietaryTags().contains(diet.getDietaryTag()) 
                              || diet.getDietaryTag().equalsIgnoreCase("Omnivore")) // Omnivore can eat anything
                    .collect(Collectors.toList());

            if (matchingOptions.isEmpty()) {
                // Fallback: If no strict match, just give them the first available option
                matchingOptions = new ArrayList<>(menuTemplates);
            }

            // Group by category to ensure 1 Drink, 1 Appetizer, 1 Main Course per person
            java.util.Map<String, List<ComboMenuTemplate>> optionsByCategory = matchingOptions.stream()
                    .collect(Collectors.groupingBy(t -> {
                        String cat = t.getFoodMenu().getCategory();
                        return cat != null ? cat : "Món chính";
                    }));

            for (java.util.Map.Entry<String, List<ComboMenuTemplate>> entry : optionsByCategory.entrySet()) {
                List<ComboMenuTemplate> catOptions = entry.getValue();
                int numCatOptions = catOptions.size();
                int baseQuantityPerOption = guestCountForDiet / numCatOptions;
                int remainder = guestCountForDiet % numCatOptions;

                for (int i = 0; i < numCatOptions; i++) {
                    int qty = baseQuantityPerOption + (i < remainder ? 1 : 0);
                    if (qty > 0) {
                        DailyMealOrder order = DailyMealOrder.builder()
                                .roomBooking(booking)
                                .serveDate(serveDate)
                                .mealType(mealType)
                                .dietaryTag(diet.getDietaryTag())
                                .foodMenu(catOptions.get(i).getFoodMenu())
                                .quantity(qty)
                                .status("PENDING")
                                .build();
                        ordersToSave.add(order);
                    }
                }
            }
        }

        // Auto-allocation of kid's combo if child under 5 exists
        if (booking.getChildrenUnder5() != null && booking.getChildrenUnder5() > 0) {
            foodMenuRepository.findByDishName("Combo Trẻ Em Dưới 5 Tuổi").ifPresent(kidsCombo -> {
                DailyMealOrder kidsOrder = DailyMealOrder.builder()
                        .roomBooking(booking)
                        .serveDate(serveDate)
                        .mealType(mealType)
                        .dietaryTag("Kids")
                        .foodMenu(kidsCombo)
                        .quantity(booking.getChildrenUnder5())
                        .status("PENDING")
                        .build();
                ordersToSave.add(kidsOrder);
            });
        }

        // Save generated menu to DB
        return dailyMealOrderRepository.saveAll(ordersToSave);
    }
}
