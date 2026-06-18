package fu.se.smms.service;

import fu.se.smms.dto.BookingRequestDTO;
import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomBookingService {

    private final UserRepository userRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final RetreatPackageRepository retreatPackageRepository;
    private final RoomRepository roomRepository;
    private final MedicalProfileRepository medicalProfileRepository;
    
    private final FoodOrderRepository foodOrderRepository;
    private final FoodOrderDetailRepository foodOrderDetailRepository;
    private final FoodMenuRepository foodMenuRepository;
    private final PackageFoodLimitRepository packageFoodLimitRepository;
    private final InvoiceService invoiceService;

    public RoomBookingService(UserRepository userRepository,
                              RoomBookingRepository roomBookingRepository,
                              RetreatPackageRepository retreatPackageRepository,
                              RoomRepository roomRepository,
                              MedicalProfileRepository medicalProfileRepository,
                              FoodOrderRepository foodOrderRepository,
                              FoodOrderDetailRepository foodOrderDetailRepository,
                              FoodMenuRepository foodMenuRepository,
                              PackageFoodLimitRepository packageFoodLimitRepository,
                              InvoiceService invoiceService) {
        this.userRepository = userRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.retreatPackageRepository = retreatPackageRepository;
        this.roomRepository = roomRepository;
        this.medicalProfileRepository = medicalProfileRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderDetailRepository = foodOrderDetailRepository;
        this.foodMenuRepository = foodMenuRepository;
        this.packageFoodLimitRepository = packageFoodLimitRepository;
        this.invoiceService = invoiceService;
    }

    @Transactional
    public RoomBooking createBooking(BookingRequestDTO dto) {
        // 1. Get or create user
        User user = userRepository.findByEmail(dto.getEmail()).orElseGet(() -> {
            User newUser = User.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .phone(dto.getPhone())
                    .role("GUEST")
                    .status("ACTIVE")
                    .passwordHash("DummyHash123") // Should be generated/random in reality
                    .build();
            return userRepository.save(newUser);
        });

        // 2. Update Medical Profile
        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(user.getUserId());
        MedicalProfile profile = profileOpt.orElseGet(() -> {
            MedicalProfile newProfile = new MedicalProfile();
            newProfile.setUser(user);
            return newProfile;
        });
        
        profile.setExplicitConsentSigned(dto.getExplicitConsentSigned() != null ? dto.getExplicitConsentSigned() : false);
        if (dto.getAllergies() != null) {
            profile.setFoodAllergiesEncrypted(dto.getAllergies()); // using setter that encrypts
        }
        profile.setUpdatedAt(LocalDateTime.now());
        medicalProfileRepository.save(profile);

        // 3. Create RoomBooking
        RoomBooking booking = new RoomBooking();
        booking.setUser(user);
        
        if (dto.getPackageId() != null) {
            retreatPackageRepository.findById(dto.getPackageId()).ifPresent(booking::setRetreatPackage);
        }

        // Parse dates
        LocalDateTime checkIn = dto.getCheckInDate();
        LocalDateTime checkOut = dto.getCheckOutDate();
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setStatus("PENDING_DEPOSIT");
        booking.setTotalDeposit(BigDecimal.ZERO); // For simplicity
        
        // 4. Create RoomBookingDetail
        // Find a room (mock logic: just get the first available room or room ID 1)
        List<Room> allRooms = roomRepository.findAll();
        Room room = allRooms.isEmpty() ? null : allRooms.get(0);
        
        if (room != null) {
            RoomBookingDetail detail = new RoomBookingDetail();
            detail.setRoomBooking(booking);
            detail.setRoom(room);
            detail.setPriceAtBooking(BigDecimal.valueOf(5000000)); // Mock price
            
            List<RoomBookingDetail> details = new ArrayList<>();
            details.add(detail);
            booking.setDetails(details);
        }

        RoomBooking savedBooking = roomBookingRepository.save(booking);

        // 5. Process Meal Selections
        if (dto.getMealSelections() != null && !dto.getMealSelections().isEmpty()) {
            // Retrieve package limits if any
            Integer packageId = dto.getPackageId();
            List<PackageFoodLimit> limits = (packageId != null) ? packageFoodLimitRepository.findByPackageId(packageId)
                    : Collections.emptyList();

            Map<Integer, Integer> packageLimitMap = limits.stream()
                    .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

            for (Map.Entry<String, Map<String, Map<Integer, Integer>>> dateEntry : dto.getMealSelections().entrySet()) {
                String dateStr = dateEntry.getKey();
                Map<String, Map<Integer, Integer>> periods = dateEntry.getValue();

                LocalDateTime mealTime;
                try {
                    mealTime = java.time.LocalDate.parse(dateStr).atTime(8, 0);
                } catch (Exception e) {
                    mealTime = LocalDateTime.now();
                }

                FoodOrder foodOrder = FoodOrder.builder()
                        .user(user)
                        .roomBooking(savedBooking)
                        .orderTime(mealTime)
                        .status("PENDING")
                        .totalAmount(BigDecimal.ZERO)
                        .build();

                foodOrder = foodOrderRepository.save(foodOrder);
                BigDecimal totalExtraCharges = BigDecimal.ZERO;
                List<FoodOrderDetail> detailsToSave = new ArrayList<>();
                Map<Integer, Integer> dailySelectedCounts = new java.util.HashMap<>();

                for (Map.Entry<String, Map<Integer, Integer>> periodEntry : periods.entrySet()) {
                    String period = periodEntry.getKey();
                    Map<Integer, Integer> foods = periodEntry.getValue();

                    for (Map.Entry<Integer, Integer> foodEntry : foods.entrySet()) {
                        Integer foodId = foodEntry.getKey();
                        Integer qty = foodEntry.getValue();
                        
                        if (qty == null || qty <= 0) continue;

                        Optional<FoodMenu> menuOpt = foodMenuRepository.findById(foodId);
                        if (menuOpt.isEmpty()) continue;
                        FoodMenu dish = menuOpt.get();

                        int previousQty = dailySelectedCounts.getOrDefault(foodId, 0);
                        int newQty = previousQty + qty;
                        dailySelectedCounts.put(foodId, newQty);

                        boolean isPackageIncluded = false;
                        BigDecimal itemCost = BigDecimal.ZERO;

                        if (packageLimitMap.containsKey(foodId)) {
                            int limitPerDay = packageLimitMap.get(foodId);
                            if (newQty <= limitPerDay) {
                                isPackageIncluded = true;
                            } else {
                                int overQty = newQty - limitPerDay;
                                int billableQty = Math.min(qty, overQty);
                                itemCost = dish.getPrice().multiply(new BigDecimal(billableQty));
                            }
                        } else {
                            itemCost = dish.getPrice().multiply(new BigDecimal(qty));
                        }

                        totalExtraCharges = totalExtraCharges.add(itemCost);

                        FoodOrderDetail detail = FoodOrderDetail.builder()
                                .foodOrder(foodOrder)
                                .foodMenu(dish)
                                .quantity(qty)
                                .priceAtOrder(dish.getPrice())
                                .specialNote("[Bữa: " + period + ", Ngày: " + dateStr + "]")
                                .isPackageIncluded(isPackageIncluded)
                                .build();

                        detailsToSave.add(detail);
                    }
                }

                foodOrderDetailRepository.saveAll(detailsToSave);
                foodOrder.setTotalAmount(totalExtraCharges);
                foodOrderRepository.save(foodOrder);
            }
        }

        invoiceService.createInvoice(savedBooking.getBookingId());

        return savedBooking;
    }
}
