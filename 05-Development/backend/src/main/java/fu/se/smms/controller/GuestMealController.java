package fu.se.smms.controller;

import fu.se.smms.dto.MealPreselectionDTO;
import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import fu.se.smms.service.TableAssignmentService;
import fu.se.smms.util.AESUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import fu.se.smms.service.InvoiceService;

@RestController
@RequestMapping("/guest")
public class GuestMealController {

    private final UserRepository userRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final MedicalProfileRepository medicalProfileRepository;
    private final FoodMenuRepository foodMenuRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final FoodOrderDetailRepository foodOrderDetailRepository;
    private final PackageFoodLimitRepository packageFoodLimitRepository;
    private final InvoiceService invoiceService;
    private final TableAssignmentService tableAssignmentService;

    @Value("${app.food-order.cutoff-hour:22}")
    private int cutoffHour;

    public GuestMealController(UserRepository userRepository,
            RoomBookingRepository roomBookingRepository,
            MedicalProfileRepository medicalProfileRepository,
            FoodMenuRepository foodMenuRepository,
            FoodOrderRepository foodOrderRepository,
            FoodOrderDetailRepository foodOrderDetailRepository,
            PackageFoodLimitRepository packageFoodLimitRepository,
            InvoiceService invoiceService,
            TableAssignmentService tableAssignmentService) {
        this.userRepository = userRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.medicalProfileRepository = medicalProfileRepository;
        this.foodMenuRepository = foodMenuRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderDetailRepository = foodOrderDetailRepository;
        this.packageFoodLimitRepository = packageFoodLimitRepository;
        this.invoiceService = invoiceService;
        this.tableAssignmentService = tableAssignmentService;
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

            // Fetch dynamic package food limits from database
            List<Integer> includedFoodIds = new ArrayList<>();
            if (activeBooking.getPackageId() != null) {
                List<PackageFoodLimit> limits = packageFoodLimitRepository
                        .findByPackageId(activeBooking.getPackageId());
                if (limits != null) {
                    includedFoodIds = limits.stream()
                            .map(l -> l.getFoodMenu().getFoodId())
                            .collect(Collectors.toList());
                }
            }
            bookingInfo.put("includedFoodIds", includedFoodIds);

            // Fetch existing food orders for this booking
            List<FoodOrder> orders = foodOrderRepository.findByRoomBooking_BookingId(activeBooking.getBookingId());
            String tableNumber = "N/A";
            List<Map<String, Object>> ordersList = new ArrayList<>();
            for (FoodOrder order : orders) {
                if (order.getTable() != null && "N/A".equals(tableNumber)) {
                    tableNumber = order.getTable().getTableNumber();
                }
                
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("orderTime", order.getOrderTime());
                orderMap.put("status", order.getStatus());
                orderMap.put("totalAmount", order.getTotalAmount());
                
                List<FoodOrderDetail> details = foodOrderDetailRepository.findByFoodOrder_OrderId(order.getOrderId());
                List<Map<String, Object>> detailList = new ArrayList<>();
                for (FoodOrderDetail detail : details) {
                    Map<String, Object> detailMap = new HashMap<>();
                    detailMap.put("foodId", detail.getFoodMenu().getFoodId());
                    detailMap.put("quantity", detail.getQuantity());
                    detailMap.put("specialNote", detail.getSpecialNote());
                    if (detail.getFoodMenu() != null) {
                        detailMap.put("dishName", detail.getFoodMenu().getDishName());
                    }
                    detailMap.put("isPackageIncluded", detail.getIsPackageIncluded());
                    detailList.add(detailMap);
                }
                orderMap.put("details", detailList);
                ordersList.add(orderMap);
            }
            bookingInfo.put("orders", ordersList);
            bookingInfo.put("tableName", tableNumber);

            response.put("booking", bookingInfo);
        } else {
            response.put("booking", null);
        }

        if (profile != null) {
            Map<String, Object> profileInfo = new HashMap<>();
            profileInfo.put("profileId", profile.getProfileId());
            profileInfo.put("explicitConsentSigned", profile.getExplicitConsentSigned());

            // Sensitive fields decrypted only if explicit consent is signed (Decree 356
            // Compliance)
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
     * Guest signs explicit consent for personal sensitive data processing (Decree
     * 356).
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
        return ResponseEntity
                .ok(Map.of("message", "Consent status updated successfully", "explicitConsentSigned", consent));
    }

    /**
     * Retrieve food menu with automatic warning indicator flags based on the user's
     * allergy profile.
     */
    @GetMapping("/menu")
    public ResponseEntity<?> getFilteredMenu(@RequestParam(required = false) Integer userId) {
        List<FoodMenu> allItems = foodMenuRepository.findAll();

        boolean consentSigned = false;
        String allergiesRaw = "";

        if (userId != null) {
            Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(userId);

            if (profileOpt.isPresent()) {
                MedicalProfile mp = profileOpt.get();
                consentSigned = Boolean.TRUE.equals(mp.getExplicitConsentSigned());
                if (consentSigned) {
                    String decrypted = AESUtil.decrypt(mp.getFoodAllergiesEncrypted());
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(decrypted);
                        List<String> list = new ArrayList<>();
                        if (node.has("selected") && node.get("selected").isArray()) {
                            for (JsonNode item : node.get("selected")) {
                                list.add(item.asText());
                            }
                        }
                        if (node.has("other") && !node.get("other").asText().isEmpty()) {
                            list.add(node.get("other").asText());
                        }
                        allergiesRaw = String.join(", ", list).toLowerCase();
                    } catch (Exception e) {
                        allergiesRaw = decrypted.toLowerCase();
                    }
                }
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
            map.put("image", item.getImageUrl() != null ? item.getImageUrl() : "/images/dishes/dish_chao_yen_mach.png");
            map.put("isPackageIncluded", item.getIsPackageIncluded());
            map.put("periods", item.getPeriods());
            map.put("availableDays", item.getAvailableDays());

            boolean isAllergen = false;
            String warningMsg = "";

            if (consentSigned && !allergiesRaw.isEmpty()) {
                // Use the explicit allergen column from the Chef's database to prevent false positives
                // (e.g., description containing "dễ tiêu hóa" falsely triggering "tiêu" allergy)
                String chefAllergens = item.getAllergens() != null ? item.getAllergens().toLowerCase() : "";

                // Segment keywords by comma or semicolon (e.g. "đậu phộng, hải sản") to
                // preserve multi-word allergies
                String[] allergyItems = allergiesRaw.split("\\s*[,;]\\s*");
                for (String allergyItem : allergyItems) {
                    String trimmed = allergyItem.trim().toLowerCase();
                    boolean matches = false;
                    String vnName = trimmed;

                    if (trimmed.contains("đậu phộng") || trimmed.contains("peanut") || trimmed.contains("lạc")) {
                        vnName = "Đậu phộng";
                        if (checkAllergyKeyword(chefAllergens, "đậu phộng", "peanut", "lạc")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("hải sản") || trimmed.contains("seafood") || trimmed.contains("tôm")
                            || trimmed.contains("shrimp") || trimmed.contains("cua") || trimmed.contains("fish")
                            || trimmed.contains("cá") || trimmed.contains("shellfish")) {
                        vnName = "Hải sản";
                        if (checkAllergyKeyword(chefAllergens, "hải sản", "seafood", "tôm", "shrimp", "cua", "fish", "cá", "shellfish")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("ớt") || trimmed.contains("cay") || trimmed.contains("chili") || trimmed.contains("spicy")) {
                        vnName = "Đồ Cay / Ớt";
                        if (checkAllergyKeyword(chefAllergens, "ớt", "cay", "chili", "spicy")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("gluten") || trimmed.contains("lúa mì") || trimmed.contains("wheat")) {
                        vnName = "Gluten / Lúa mì";
                        if (checkAllergyKeyword(chefAllergens, "gluten", "lúa mì", "wheat")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("dairy") || trimmed.contains("sữa") || trimmed.contains("lactose") || trimmed.contains("milk")) {
                        vnName = "Sữa / Lactose";
                        if (checkAllergyKeyword(chefAllergens, "dairy", "sữa", "lactose", "milk")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("soy") || trimmed.contains("đậu nành")) {
                        vnName = "Đậu nành";
                        if (checkAllergyKeyword(chefAllergens, "soy", "đậu nành")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("trứng") || trimmed.contains("egg")) {
                        vnName = "Trứng";
                        if (checkAllergyKeyword(chefAllergens, "trứng", "egg")) {
                            matches = true;
                        }
                    } else if (trimmed.contains("tree nuts") || trimmed.contains("hạt cây") || trimmed.contains("hạt điều") 
                            || trimmed.contains("óc chó") || trimmed.contains("walnut") || trimmed.contains("cashew") || trimmed.contains("nut")) {
                        vnName = "Các loại hạt (Tree nuts)";
                        if (checkAllergyKeyword(chefAllergens, "tree nuts", "hạt cây", "hạt điều", "óc chó", "walnut", "cashew", "nut")) {
                            matches = true;
                        }
                    } else {
                        if (trimmed.length() >= 2 && checkAllergyKeyword(chefAllergens, trimmed)) {
                            matches = true;
                        }
                    }

                    if (matches) {
                        isAllergen = true;
                        // Capitalize the first letter of the warning word
                        vnName = vnName.substring(0, 1).toUpperCase() + vnName.substring(1);
                        warningMsg = "Phát hiện thành phần gây dị ứng: " + vnName;
                        break;
                    }
                }
            }

            map.put("isAllergen", isAllergen);
            map.put("warningMessage", warningMsg);
            map.put("isTodayMenu", item.getIsTodayMenu() != null ? item.getIsTodayMenu() : true);
            map.put("soldOut", item.getSoldOut() != null ? item.getSoldOut() : false);
            map.put("enabled", item.getEnabled() != null ? item.getEnabled() : true);
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
            return ResponseEntity.status(404).body("User not found.");
        }
        User user = userOpt.get();

        Optional<RoomBooking> bookingOpt = roomBookingRepository.findById(dto.getBookingId());
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Booking not found.");
        }
        RoomBooking booking = bookingOpt.get();

        // Retrieve package limits if any
        Integer packageId = booking.getPackageId();
        List<PackageFoodLimit> limits = (packageId != null) ? packageFoodLimitRepository.findByPackageId(packageId)
                : Collections.emptyList();

        Map<Integer, Integer> packageLimitMap = limits.stream()
                .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

        // Group selections by date and period
        Map<String, List<MealPreselectionDTO.MealSelectionItem>> itemsByDateAndPeriod = new HashMap<>();
        for (MealPreselectionDTO.MealSelectionItem item : dto.getSelections()) {
            String period = item.getPeriod() != null ? item.getPeriod() : "Breakfast";
            String key = item.getDate() + "_" + period;
            itemsByDateAndPeriod.computeIfAbsent(key, k -> new ArrayList<>()).add(item);
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        int currentHour = java.time.LocalTime.now().getHour();

        for (String key : itemsByDateAndPeriod.keySet()) {
            String dateKey = key.split("_")[0];
            try {
                java.time.LocalDate targetDate = java.time.LocalDate.parse(dateKey);
                if (!targetDate.isAfter(today)) {
                    return ResponseEntity.badRequest().body("Cannot order meals for today or past dates.");
                }
                if (targetDate.equals(today.plusDays(1)) && currentHour >= cutoffHour) {
                    return ResponseEntity.badRequest().body("Đã qua thời gian hạn chót (Cut-off Time " + cutoffHour + ":00). Không thể đặt trước món ăn cho ngày mai.");
                }
            } catch (Exception e) {
                // Ignore parsing error, will be handled in the loop below
            }
        }

        List<Integer> createdOrderIds = new ArrayList<>();
        BigDecimal grandTotalExtraCharges = BigDecimal.ZERO;
        int totalItemCount = 0;

        for (Map.Entry<String, List<MealPreselectionDTO.MealSelectionItem>> entry : itemsByDateAndPeriod.entrySet()) {
            String key = entry.getKey();
            String[] parts = key.split("_");
            String dateKey = parts[0];
            String period = parts.length > 1 ? parts[1] : "Breakfast";
            List<MealPreselectionDTO.MealSelectionItem> items = entry.getValue();

            LocalDateTime mealTime;
            try {
                java.time.LocalDate d = java.time.LocalDate.parse(dateKey);
                if (period.equalsIgnoreCase("Breakfast")) {
                    mealTime = d.atTime(7, 0);
                } else if (period.equalsIgnoreCase("Lunch")) {
                    mealTime = d.atTime(11, 30);
                } else if (period.equalsIgnoreCase("Dinner")) {
                    mealTime = d.atTime(18, 0);
                } else {
                    mealTime = d.atTime(8, 0);
                }
            } catch (Exception e) {
                mealTime = LocalDateTime.now();
            }

            // Find if an order already exists for this booking on this date AND this period
            FoodOrder foodOrder = null;
            List<FoodOrder> existingOrders = foodOrderRepository.findByRoomBooking_BookingId(booking.getBookingId());
            for (FoodOrder eo : existingOrders) {
                if (eo.getOrderTime() != null && eo.getOrderTime().toLocalDate().equals(mealTime.toLocalDate())) {
                    int eoHour = eo.getOrderTime().getHour();
                    int mealHour = mealTime.getHour();
                    
                    String eoPeriod = "Breakfast";
                    if (eoHour >= 10 && eoHour < 14) eoPeriod = "Lunch";
                    else if (eoHour >= 14) eoPeriod = "Dinner";
                    
                    String mPeriod = "Breakfast";
                    if (mealHour >= 10 && mealHour < 14) mPeriod = "Lunch";
                    else if (mealHour >= 14) mPeriod = "Dinner";

                    if (eoPeriod.equals(mPeriod)) {
                        foodOrder = eo;
                        break;
                    }
                }
            }

            if (foodOrder == null) {
                RestaurantTable assignedTable = tableAssignmentService.assignTable(2);

                foodOrder = FoodOrder.builder()
                        .user(user)
                        .roomBooking(booking)
                        .orderTime(mealTime)
                        .status("PENDING")
                        .totalAmount(BigDecimal.ZERO)
                        .origin("PACKAGE MEAL")
                        .table(assignedTable)
                        .build();
                foodOrder = foodOrderRepository.save(foodOrder);
            } else {
                // Delete existing details so we can replace them with new selection
                List<FoodOrderDetail> oldDetails = foodOrderDetailRepository.findByFoodOrder_OrderId(foodOrder.getOrderId());
                foodOrderDetailRepository.deleteAll(oldDetails);
            }

            createdOrderIds.add(foodOrder.getOrderId());

            BigDecimal totalExtraCharges = BigDecimal.ZERO;
            List<FoodOrderDetail> detailsToSave = new ArrayList<>();
            Map<Integer, Integer> dailySelectedCounts = new HashMap<>(); // Track counts within this day

            for (MealPreselectionDTO.MealSelectionItem item : items) {
                Optional<FoodMenu> menuOpt = foodMenuRepository.findById(item.getFoodId());
                if (menuOpt.isEmpty())
                    continue;
                FoodMenu dish = menuOpt.get();

                int previousQty = dailySelectedCounts.getOrDefault(item.getFoodId(), 0);
                int newQty = previousQty + item.getQuantity();
                dailySelectedCounts.put(item.getFoodId(), newQty);

                boolean isPackageIncluded = false;
                BigDecimal itemCost = BigDecimal.ZERO;

                if (packageLimitMap.containsKey(item.getFoodId())) {
                    int limitPerDay = packageLimitMap.get(item.getFoodId());
                    if (newQty <= limitPerDay) {
                        isPackageIncluded = true;
                    } else {
                        // Over limit
                        int overQty = newQty - limitPerDay;
                        int billableQty = Math.min(item.getQuantity(), overQty);
                        itemCost = dish.getPrice().multiply(new BigDecimal(billableQty));
                    }
                } else {
                    itemCost = dish.getPrice().multiply(new BigDecimal(item.getQuantity()));
                }

                totalExtraCharges = totalExtraCharges.add(itemCost);

                FoodOrderDetail detail = FoodOrderDetail.builder()
                        .foodOrder(foodOrder)
                        .foodMenu(dish)
                        .quantity(item.getQuantity())
                        .priceAtOrder(dish.getPrice())
                        .specialNote(item.getSpecialNote())
                        .isPackageIncluded(isPackageIncluded)
                        .build();

                detailsToSave.add(detail);
            }

            foodOrderDetailRepository.saveAll(detailsToSave);
            totalItemCount += detailsToSave.size();

            // Update total extra charge on the daily food order
            foodOrder.setTotalAmount(totalExtraCharges);
            foodOrderRepository.save(foodOrder);

            grandTotalExtraCharges = grandTotalExtraCharges.add(totalExtraCharges);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("orderIds", createdOrderIds);
        result.put("status", "PENDING");
        result.put("totalAmount", grandTotalExtraCharges);
        result.put("itemCount", totalItemCount);

        return ResponseEntity.ok(result);
    }

    /**
     * Chef role specific endpoint (Data Minimization compliance - UC20 / RBAC)
     * Retrieves guest allergen profiles without returning physical conditions or
     * clinic diagnosis fields.
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

                // Find active room numbers using native DB lookup
                List<RoomBooking> activeBookings = roomBookingRepository
                        .findActiveBookingsByUserId(mp.getUser().getUserId());
                List<String> roomNumbers = roomBookingRepository
                        .findActiveRoomNumbersByUserId(mp.getUser().getUserId());
                
                boolean isStayingToday = false;
                java.time.LocalDate today = java.time.LocalDate.now();
                if (!activeBookings.isEmpty()) {
                    for (RoomBooking b : activeBookings) {
                        java.time.LocalDate checkIn = b.getCheckInDate().toLocalDate();
                        java.time.LocalDate checkOut = b.getCheckOutDate().toLocalDate();
                        if (!checkOut.isBefore(today) && checkIn.isBefore(today.plusDays(3))) {
                            isStayingToday = true;
                            break;
                        }
                    }
                }

                if (!isStayingToday) {
                    continue; // Skip guests not currently staying
                }

                if (!activeBookings.isEmpty()) {
                    guestAllergyMap.put("room", roomNumbers.isEmpty() ? "N/A" : String.join(", ", roomNumbers));
                    guestAllergyMap.put("checkIn", activeBookings.get(0).getCheckInDate().toString().split("T")[0]);
                } else {
                    guestAllergyMap.put("room", "N/A");
                    guestAllergyMap.put("checkIn", "N/A");
                }

                // Decrypt ONLY food allergies, do NOT decrypt or return physicalCondition
                // clinical logs!
                String decryptedAllergies = AESUtil.decrypt(mp.getFoodAllergiesEncrypted());
                String readableAllergies = decryptedAllergies;
                String dietaryPreference = "Healthy";
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode node = mapper.readTree(decryptedAllergies);
                    List<String> list = new ArrayList<>();
                    if (node.has("selected") && node.get("selected").isArray()) {
                        for (JsonNode item : node.get("selected")) {
                            String val = item.asText();
                            // Optional: map English keys to VN names for the chef dashboard if needed
                            if (val.equalsIgnoreCase("peanuts")) val = "Đậu phộng";
                            else if (val.equalsIgnoreCase("shellfish")) val = "Hải sản có vỏ";
                            else if (val.equalsIgnoreCase("spicy")) val = "Đồ cay";
                            else if (val.equalsIgnoreCase("gluten")) val = "Gluten / Lúa mì";
                            else if (val.equalsIgnoreCase("dairy")) val = "Sữa / Lactose";
                            else if (val.equalsIgnoreCase("soy")) val = "Đậu nành";
                            else if (val.equalsIgnoreCase("egg")) val = "Trứng";
                            else if (val.equalsIgnoreCase("treenuts")) val = "Hạt cây";
                            list.add(val);
                        }
                    }
                    if (node.has("other") && !node.get("other").asText().isEmpty()) {
                        list.add(node.get("other").asText());
                    }
                    readableAllergies = String.join(", ", list);
                    if (readableAllergies.isEmpty()) {
                        readableAllergies = "Không có";
                    }
                    
                    if (node.has("diet") && !node.get("diet").asText().isEmpty()) {
                        String diet = node.get("diet").asText().toLowerCase();
                        if (diet.contains("vegetarian")) dietaryPreference = "Chay (Vegetarian)";
                        else if (diet.contains("vegan")) dietaryPreference = "Thuần chay (Vegan)";
                        else if (diet.contains("pescatarian")) dietaryPreference = "Ăn cá (Pescatarian)";
                        else if (diet.contains("keto")) dietaryPreference = "Keto";
                        else if (diet.contains("halal")) dietaryPreference = "Halal";
                        else dietaryPreference = "Ăn tạp (Omnivore)";
                    }
                } catch (Exception e) {
                    // Fallback if not JSON
                    if (decryptedAllergies == null || decryptedAllergies.trim().isEmpty()) {
                        readableAllergies = "Không có";
                    }
                    if (decryptedAllergies.toLowerCase().contains("chay") || decryptedAllergies.toLowerCase().contains("vegan")) {
                        dietaryPreference = "Vegan";
                    }
                }
                guestAllergyMap.put("allergies", readableAllergies);
                guestAllergyMap.put("dietary", dietaryPreference);

                resultList.add(guestAllergyMap);
            }
        }
        return ResponseEntity.ok(resultList);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> payload) {
        // ... (mock implementation omitted for brevity)
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    /**
     * Helper method to check if the content contains the exact word/phrase.
     * Prevents false positives like "cám" matching "cá".
     */
    private boolean checkAllergyKeyword(String content, String... keywords) {
        if (content == null) return false;
        // Pad the string and replace punctuation with spaces
        String padded = " " + content.replaceAll("[\\p{Punct}]", " ") + " ";
        for (String kw : keywords) {
            if (kw == null || kw.trim().isEmpty()) continue;
            // Pad the keyword to match whole words/phrases
            if (padded.contains(" " + kw.trim().toLowerCase() + " ")) {
                return true;
            }
        }
        return false;
    }

    @PostMapping("/order-extra")
    public ResponseEntity<?> orderExtra(@RequestBody MealPreselectionDTO dto) {
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found.");
        }
        User user = userOpt.get();

        Optional<RoomBooking> bookingOpt = roomBookingRepository.findById(dto.getBookingId());
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Booking not found.");
        }
        RoomBooking booking = bookingOpt.get();

        java.time.LocalDate today = java.time.LocalDate.now();
        
        Integer packageId = booking.getPackageId();
        List<PackageFoodLimit> limits = (packageId != null) ? packageFoodLimitRepository.findByPackageId(packageId) : Collections.emptyList();
        Map<Integer, Integer> packageLimitMap = limits.stream()
                .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

        RestaurantTable assignedTable = tableAssignmentService.assignTable(2);

        FoodOrder foodOrder = FoodOrder.builder()
                .user(user)
                .roomBooking(booking)
                .orderTime(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .origin("ROOM SERVICE")
                .table(assignedTable)
                .build();

        foodOrder = foodOrderRepository.save(foodOrder);

        BigDecimal totalExtraCharges = BigDecimal.ZERO;
        List<FoodOrderDetail> detailsToSave = new ArrayList<>();
        Map<Integer, Integer> dailySelectedCounts = new HashMap<>(); 

        for (MealPreselectionDTO.MealSelectionItem item : dto.getSelections()) {
            Optional<FoodMenu> menuOpt = foodMenuRepository.findById(item.getFoodId());
            if (menuOpt.isEmpty()) continue;
            FoodMenu dish = menuOpt.get();

            int previousQty = dailySelectedCounts.getOrDefault(item.getFoodId(), 0);
            int newQty = previousQty + item.getQuantity();
            dailySelectedCounts.put(item.getFoodId(), newQty);

            boolean isPackageIncluded = false;
            BigDecimal itemCost = BigDecimal.ZERO;

            if (packageLimitMap.containsKey(item.getFoodId())) {
                int limitPerDay = packageLimitMap.get(item.getFoodId());
                if (newQty <= limitPerDay) {
                    isPackageIncluded = true;
                } else {
                    int overQty = newQty - limitPerDay;
                    int billableQty = Math.min(item.getQuantity(), overQty);
                    itemCost = dish.getPrice().multiply(new BigDecimal(billableQty));
                }
            } else {
                itemCost = dish.getPrice().multiply(new BigDecimal(item.getQuantity()));
            }

            totalExtraCharges = totalExtraCharges.add(itemCost);

            FoodOrderDetail detail = FoodOrderDetail.builder()
                    .foodOrder(foodOrder)
                    .foodMenu(dish)
                    .quantity(item.getQuantity())
                    .priceAtOrder(dish.getPrice())
                    .specialNote(item.getSpecialNote())
                    .isPackageIncluded(isPackageIncluded)
                    .build();

            detailsToSave.add(detail);
        }

        foodOrderDetailRepository.saveAll(detailsToSave);
        foodOrder.setTotalAmount(totalExtraCharges);
        foodOrderRepository.save(foodOrder);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", foodOrder.getOrderId());
        result.put("status", "PENDING");
        result.put("totalAmount", totalExtraCharges);
        result.put("itemCount", detailsToSave.size());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelFoodOrder(@PathVariable Integer orderId,
                                              @RequestBody Map<String, String> request) {
        try {
            FoodOrder order = foodOrderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ăn uống."));

            if (!"PENDING".equalsIgnoreCase(order.getStatus()) && !"PREPARING".equalsIgnoreCase(order.getStatus())) {
                throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại: " + order.getStatus());
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime serveTime = order.getOrderTime();
            long diffMinutes = java.time.Duration.between(now, serveTime).toMinutes();

            if (diffMinutes < 120) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đối với đồ ăn, không thể hủy đơn hàng trước giờ phục vụ dưới 2 tiếng."));
            }

            BigDecimal refundAmt = BigDecimal.ZERO;
            BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

            if (diffMinutes >= 240) {
                refundAmt = totalAmount; // Hoàn 100%
            } else {
                refundAmt = totalAmount.multiply(new BigDecimal("0.50")).setScale(2, java.math.RoundingMode.HALF_UP); // Hoàn 50%
            }

            String reason = request.get("reason");
            order.setStatus("CANCELLED");
            order.setCancellationReason(reason);
            order.setCancellationTime(now);
            order.setRefundAmount(refundAmt);

            FoodOrder savedOrder = foodOrderRepository.save(order);

            // Recalculate invoice if associated with a booking
            if (order.getRoomBooking() != null) {
                try {
                    invoiceService.createInvoice(order.getRoomBooking().getBookingId());
                } catch (Exception ignored) {}
            }

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getOrderId());
            response.put("status", savedOrder.getStatus());
            response.put("totalAmount", savedOrder.getTotalAmount());
            response.put("refundAmount", savedOrder.getRefundAmount());
            response.put("penaltyAmount", totalAmount.subtract(refundAmt));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
