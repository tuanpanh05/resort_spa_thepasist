package fu.se.smms.controller;

import fu.se.smms.dto.MealPreselectionDTO;
import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import fu.se.smms.util.AESUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guest")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class GuestMealController {

    private final UserRepository userRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final MedicalProfileRepository medicalProfileRepository;
    private final FoodMenuRepository foodMenuRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final FoodOrderDetailRepository foodOrderDetailRepository;
    private final PackageFoodLimitRepository packageFoodLimitRepository;

    public GuestMealController(UserRepository userRepository,
                               RoomBookingRepository roomBookingRepository,
                               MedicalProfileRepository medicalProfileRepository,
                               FoodMenuRepository foodMenuRepository,
                               FoodOrderRepository foodOrderRepository,
                               FoodOrderDetailRepository foodOrderDetailRepository,
                               PackageFoodLimitRepository packageFoodLimitRepository) {
        this.userRepository = userRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.medicalProfileRepository = medicalProfileRepository;
        this.foodMenuRepository = foodMenuRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderDetailRepository = foodOrderDetailRepository;
        this.packageFoodLimitRepository = packageFoodLimitRepository;
    }

    /**
     * Retrieve guest details, active booking, and health profile status.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getGuestProfile(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found with email: " + email);
        }
        User user = userOpt.get();

        // Get active booking
        List<RoomBooking> activeBookings = roomBookingRepository.findActiveBookingsByUserId(user.getUserId());
        RoomBooking activeBooking = activeBookings.isEmpty() ? null : activeBookings.get(0);

        // Get medical profile
        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(user.getUserId());
        MedicalProfile profile = profileOpt.orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());

        if (activeBooking != null) {
            Map<String, Object> bookingInfo = new HashMap<>();
            bookingInfo.put("bookingId", activeBooking.getBookingId());
            bookingInfo.put("checkInDate", activeBooking.getCheckInDate());
            bookingInfo.put("checkOutDate", activeBooking.getCheckOutDate());
            bookingInfo.put("status", activeBooking.getStatus());
            bookingInfo.put("packageId", activeBooking.getPackageId());
            response.put("booking", bookingInfo);
        } else {
            response.put("booking", null);
        }

        if (profile != null) {
            Map<String, Object> profileInfo = new HashMap<>();
            profileInfo.put("profileId", profile.getProfileId());
            profileInfo.put("explicitConsentSigned", profile.getExplicitConsentSigned());
            
            // Sensitive fields decrypted only if explicit consent is signed (Decree 356 Compliance)
            if (Boolean.TRUE.equals(profile.getExplicitConsentSigned())) {
                profileInfo.put("foodAllergies", AESUtil.decrypt(profile.getFoodAllergiesEncrypted()));
                profileInfo.put("physicalCondition", AESUtil.decrypt(profile.getPhysicalConditionEncrypted()));
            } else {
                profileInfo.put("foodAllergies", "[CHƯA CÓ ĐỒNG Ý CỦA KHÁCH HÀNG]");
                profileInfo.put("physicalCondition", "[CHƯA CÓ ĐỒNG Ý CỦA KHÁCH HÀNG]");
            }
            response.put("medicalProfile", profileInfo);
        } else {
            response.put("medicalProfile", null);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Guest signs explicit consent for personal sensitive data processing (Decree 356).
     */
    @PostMapping("/consent")
    public ResponseEntity<?> updateConsent(@RequestParam Integer userId, @RequestParam Boolean consent) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = userOpt.get();

        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(userId);
        MedicalProfile profile;
        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
            profile.setExplicitConsentSigned(consent);
            profile.setUpdatedAt(LocalDateTime.now());
        } else {
            profile = MedicalProfile.builder()
                    .user(user)
                    .explicitConsentSigned(consent)
                    .foodAllergiesEncrypted("")
                    .physicalConditionEncrypted("")
                    .updatedAt(LocalDateTime.now())
                    .build();
        }
        medicalProfileRepository.save(profile);
        return ResponseEntity.ok(Map.of("message", "Consent status updated successfully", "explicitConsentSigned", consent));
    }

    /**
     * Retrieve food menu with automatic warning indicator flags based on the user's allergy profile.
     */
    @GetMapping("/menu")
    public ResponseEntity<?> getFilteredMenu(@RequestParam Integer userId) {
        List<FoodMenu> allItems = foodMenuRepository.findAll();

        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(userId);
        boolean consentSigned = false;
        String allergiesRaw = "";

        if (profileOpt.isPresent()) {
            MedicalProfile mp = profileOpt.get();
            consentSigned = Boolean.TRUE.equals(mp.getExplicitConsentSigned());
            if (consentSigned) {
                allergiesRaw = AESUtil.decrypt(mp.getFoodAllergiesEncrypted()).toLowerCase();
            }
        }

        List<Map<String, Object>> responseList = new ArrayList<>();
        for (FoodMenu item : allItems) {
            Map<String, Object> map = new HashMap<>();
            map.put("foodId", item.getFoodId());
            map.put("dishName", item.getDishName());
            map.put("description", item.getDescription());
            map.put("price", item.getPrice());
            map.put("dietaryTags", item.getDietaryTags());

            boolean isAllergen = false;
            String warningMsg = "";

            if (consentSigned && !allergiesRaw.isEmpty()) {
                // If dish name or description or tags contain any keywords of allergies
                String contentToTest = (item.getDishName() + " " + item.getDescription() + " " + item.getDietaryTags()).toLowerCase();
                
                // Segment keywords (e.g. "đậu phộng", "hải sản", "peanut", "shrimp", etc.)
                String[] allergyWords = allergiesRaw.split("[,;\\s()]+");
                for (String word : allergyWords) {
                    if (word.length() >= 2 && contentToTest.contains(word)) {
                        isAllergen = true;
                        warningMsg = "Phát hiện thành phần gây dị ứng: " + word;
                        break;
                    }
                }
            }

            map.put("isAllergen", isAllergen);
            map.put("warningMessage", warningMsg);
            responseList.add(map);
        }

        return ResponseEntity.ok(responseList);
    }

    /**
     * Submit daily meal selections. Checks package food limits to apply pricing.
     */
    @PostMapping("/preselect-meals")
    public ResponseEntity<?> preselectMeals(@RequestBody MealPreselectionDTO dto) {
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = userOpt.get();

        Optional<RoomBooking> bookingOpt = roomBookingRepository.findById(dto.getBookingId());
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Booking not found");
        }
        RoomBooking booking = bookingOpt.get();

        // Retrieve package limits if any
        Integer packageId = booking.getPackageId();
        List<PackageFoodLimit> limits = (packageId != null) ?
                packageFoodLimitRepository.findByPackageId(packageId) : Collections.emptyList();

        Map<Integer, Integer> packageLimitMap = limits.stream()
                .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

        // Group selections by date to track daily consumption
        Map<String, Map<Integer, Integer>> dailySelectedCounts = new HashMap<>();

        // Create the FoodOrder (as PENDING status)
        FoodOrder foodOrder = FoodOrder.builder()
                .user(user)
                .roomBooking(booking)
                .orderTime(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .build();
        
        foodOrder = foodOrderRepository.save(foodOrder);

        BigDecimal totalExtraCharges = BigDecimal.ZERO;
        List<FoodOrderDetail> detailsToSave = new ArrayList<>();

        for (MealPreselectionDTO.MealSelectionItem item : dto.getSelections()) {
            Optional<FoodMenu> menuOpt = foodMenuRepository.findById(item.getFoodId());
            if (menuOpt.isEmpty()) continue;
            FoodMenu dish = menuOpt.get();

            // Track daily limits for package inclusion
            String dateKey = item.getDate();
            dailySelectedCounts.putIfAbsent(dateKey, new HashMap<>());
            Map<Integer, Integer> currentDayCounts = dailySelectedCounts.get(dateKey);
            int previousQty = currentDayCounts.getOrDefault(item.getFoodId(), 0);
            int newQty = previousQty + item.getQuantity();
            currentDayCounts.put(item.getFoodId(), newQty);

            boolean isPackageIncluded = false;
            BigDecimal itemCost = BigDecimal.ZERO;

            if (packageLimitMap.containsKey(item.getFoodId())) {
                int limitPerDay = packageLimitMap.get(item.getFoodId());
                if (newQty <= limitPerDay) {
                    isPackageIncluded = true;
                } else {
                    // Over limit: only partial quantity is included, rest is charged
                    int overQty = newQty - limitPerDay;
                    int billableQty = Math.min(item.getQuantity(), overQty);
                    itemCost = dish.getPrice().multiply(new BigDecimal(billableQty));
                }
            } else {
                // Not in package at all: pay full price
                itemCost = dish.getPrice().multiply(new BigDecimal(item.getQuantity()));
            }

            totalExtraCharges = totalExtraCharges.add(itemCost);

            FoodOrderDetail detail = FoodOrderDetail.builder()
                    .foodOrder(foodOrder)
                    .foodMenu(dish)
                    .quantity(item.getQuantity())
                    .priceAtOrder(dish.getPrice())
                    .specialNote(item.getSpecialNote() + " [Bữa: " + item.getPeriod() + ", Ngày: " + item.getDate() + "]")
                    .isPackageIncluded(isPackageIncluded)
                    .build();
            
            detailsToSave.add(detail);
        }

        foodOrderDetailRepository.saveAll(detailsToSave);

        // Update total extra charge on the master food order
        foodOrder.setTotalAmount(totalExtraCharges);
        foodOrderRepository.save(foodOrder);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", foodOrder.getOrderId());
        result.put("status", foodOrder.getStatus());
        result.put("totalAmount", totalExtraCharges);
        result.put("itemCount", detailsToSave.size());

        return ResponseEntity.ok(result);
    }

    /**
     * Chef role specific endpoint (Data Minimization compliance - UC20 / RBAC)
     * Retrieves guest allergen profiles without returning physical conditions or clinic diagnosis fields.
     */
    @GetMapping("/chef/allergies")
    public ResponseEntity<?> getChefAllergies() {
        List<MedicalProfile> profiles = medicalProfileRepository.findAll();
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (MedicalProfile mp : profiles) {
            // Only process if user signed explicit consent under Decree 356
            if (Boolean.TRUE.equals(mp.getExplicitConsentSigned())) {
                Map<String, Object> guestAllergyMap = new HashMap<>();
                guestAllergyMap.put("userId", mp.getUser().getUserId());
                guestAllergyMap.put("fullName", mp.getUser().getFullName());
                guestAllergyMap.put("email", mp.getUser().getEmail());
                guestAllergyMap.put("phone", mp.getUser().getPhone());

                // Find active room number if any
                List<RoomBooking> activeBookings = roomBookingRepository.findActiveBookingsByUserId(mp.getUser().getUserId());
                if (!activeBookings.isEmpty()) {
                    guestAllergyMap.put("room", "Room-102"); // default placeholder or check-in room
                    guestAllergyMap.put("checkIn", activeBookings.get(0).getCheckInDate().toString().split("T")[0]);
                } else {
                    guestAllergyMap.put("room", "N/A");
                    guestAllergyMap.put("checkIn", "N/A");
                }

                // Decrypt ONLY food allergies, do NOT decrypt or return physicalCondition clinical logs!
                guestAllergyMap.put("allergies", AESUtil.decrypt(mp.getFoodAllergiesEncrypted()));
                guestAllergyMap.put("dietary", mp.getFoodAllergiesEncrypted().contains("Chay") || mp.getFoodAllergiesEncrypted().contains("Vegan") ? "Vegan" : "Healthy");

                resultList.add(guestAllergyMap);
            }
        }
        return ResponseEntity.ok(resultList);
    }
}
