package fu.se.smms.service.impl;

import fu.se.smms.dto.MealPreselectionDTO;
import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import fu.se.smms.service.GuestMealService;
import fu.se.smms.service.InvoiceService;
import fu.se.smms.service.TableAssignmentService;
import fu.se.smms.util.AESUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GuestMealServiceImpl implements GuestMealService {

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

    public GuestMealServiceImpl(UserRepository userRepository,
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

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getGuestProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        List<RoomBooking> activeBookings = roomBookingRepository.findActiveBookingsByUserId(user.getUserId());
        RoomBooking activeBooking = activeBookings.isEmpty() ? null : activeBookings.get(0);

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

            List<Integer> includedFoodIds = new ArrayList<>();
            if (activeBooking.getPackageId() != null) {
                List<PackageFoodLimit> limits = packageFoodLimitRepository.findByPackageId(activeBooking.getPackageId());
                if (limits != null) {
                    includedFoodIds = limits.stream()
                            .map(l -> l.getFoodMenu().getFoodId())
                            .collect(Collectors.toList());
                }
            }
            bookingInfo.put("includedFoodIds", includedFoodIds);

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

        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> updateConsent(Integer userId, Boolean consent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

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
        return Map.of("message", "Consent status updated successfully", "explicitConsentSigned", consent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFilteredMenu(Integer userId) {
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
                String chefAllergens = item.getAllergens() != null ? item.getAllergens().toLowerCase() : "";
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

        return responseList;
    }

    @Override
    @Transactional
    public Map<String, Object> preselectMeals(MealPreselectionDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        RoomBooking booking = roomBookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Integer packageId = booking.getPackageId();
        List<PackageFoodLimit> limits = (packageId != null) ? packageFoodLimitRepository.findByPackageId(packageId)
                : Collections.emptyList();

        Map<Integer, Integer> packageLimitMap = limits.stream()
                .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

        Map<String, List<MealPreselectionDTO.MealSelectionItem>> itemsByDate = new HashMap<>();
        for (MealPreselectionDTO.MealSelectionItem item : dto.getSelections()) {
            String dateKey = item.getDate();
            itemsByDate.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(item);
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        int currentHour = java.time.LocalTime.now().getHour();
        java.time.LocalDate checkInDate = booking.getCheckInDate().toLocalDate();
        java.time.LocalDate checkOutDate = booking.getCheckOutDate().toLocalDate();

        List<Integer> createdOrderIds = new ArrayList<>();
        BigDecimal grandTotalExtraCharges = BigDecimal.ZERO;
        int totalItemCount = 0;

        for (String dateKey : itemsByDate.keySet()) {
            List<MealPreselectionDTO.MealSelectionItem> items = itemsByDate.get(dateKey);
            LocalDateTime mealTime;
            try {
                java.time.LocalDate targetDate = java.time.LocalDate.parse(dateKey);
                if (!targetDate.isAfter(today)) {
                    throw new RuntimeException("Cannot order meals for today or past dates.");
                }
                if (targetDate.isBefore(checkInDate) || targetDate.isAfter(checkOutDate)) {
                    throw new RuntimeException("Ngày đặt món (" + targetDate + ") không hợp lệ. Vui lòng đặt món trong khoảng thời gian lưu trú (" + checkInDate + " đến " + checkOutDate + ").");
                }
                if (targetDate.equals(today.plusDays(1)) && currentHour >= cutoffHour) {
                    throw new RuntimeException("Đã qua thời gian hạn chót (Cut-off Time " + cutoffHour + ":00). Không thể đặt trước món ăn cho ngày mai.");
                }
                mealTime = targetDate.atTime(8, 0);
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                mealTime = LocalDateTime.now();
            }

            FoodOrder foodOrder = null;
            List<FoodOrder> existingOrders = foodOrderRepository.findByRoomBooking_BookingId(booking.getBookingId());
            for (FoodOrder eo : existingOrders) {
                if (eo.getOrderTime() != null && eo.getOrderTime().toLocalDate().equals(mealTime.toLocalDate())) {
                    foodOrder = eo;
                    break;
                }
            }

            if (foodOrder == null) {
                RestaurantTable assignedTable = tableAssignmentService.assignTable(2, mealTime);

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
                // Do not delete old items!
            }

            createdOrderIds.add(foodOrder.getOrderId());

            BigDecimal totalExtraCharges = BigDecimal.ZERO;
            List<FoodOrderDetail> detailsToSave = new ArrayList<>();
            Map<Integer, Integer> dailySelectedCounts = new HashMap<>();

            List<FoodOrderDetail> existingDetails = new ArrayList<>();
            if (foodOrder.getOrderId() != null) {
                existingDetails = foodOrderDetailRepository.findByFoodOrder_OrderId(foodOrder.getOrderId());
                for (FoodOrderDetail od : existingDetails) {
                    int qty = dailySelectedCounts.getOrDefault(od.getFoodMenu().getFoodId(), 0);
                    dailySelectedCounts.put(od.getFoodMenu().getFoodId(), qty + od.getQuantity());
                }
            }

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
                        int overQty = newQty - limitPerDay;
                        int billableQty = Math.min(item.getQuantity(), overQty);
                        itemCost = dish.getPrice().multiply(new BigDecimal(billableQty));
                    }
                } else {
                    itemCost = dish.getPrice().multiply(new BigDecimal(item.getQuantity()));
                }

                totalExtraCharges = totalExtraCharges.add(itemCost);

                String assignedPeriod = item.getPeriod() != null ? item.getPeriod() : "Breakfast";
                String noteStr = item.getSpecialNote() != null ? item.getSpecialNote().trim() : "";
                String finalNote = "[Period: " + assignedPeriod + "]" + (noteStr.isEmpty() ? "" : " " + noteStr);

                FoodOrderDetail existingDetail = null;
                for (FoodOrderDetail od : existingDetails) {
                    if (od.getFoodMenu().getFoodId().equals(item.getFoodId()) &&
                        (od.getSpecialNote() != null && od.getSpecialNote().equals(finalNote)) &&
                        (od.getIsPackageIncluded() != null && od.getIsPackageIncluded() == isPackageIncluded)) {
                        existingDetail = od;
                        break;
                    }
                }

                if (existingDetail != null) {
                    existingDetail.setQuantity(existingDetail.getQuantity() + item.getQuantity());
                    detailsToSave.add(existingDetail);
                } else {
                    FoodOrderDetail detail = FoodOrderDetail.builder()
                            .foodOrder(foodOrder)
                            .foodMenu(dish)
                            .quantity(item.getQuantity())
                            .priceAtOrder(dish.getPrice())
                            .specialNote(finalNote)
                            .isPackageIncluded(isPackageIncluded)
                            .build();
                    detailsToSave.add(detail);
                }
            }

            foodOrderDetailRepository.saveAll(detailsToSave);
            totalItemCount += detailsToSave.size();

            BigDecimal currentTotal = foodOrder.getTotalAmount() != null ? foodOrder.getTotalAmount() : BigDecimal.ZERO;
            foodOrder.setTotalAmount(currentTotal.add(totalExtraCharges));
            foodOrderRepository.save(foodOrder);

            grandTotalExtraCharges = grandTotalExtraCharges.add(totalExtraCharges);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("orderIds", createdOrderIds);
        result.put("status", "PENDING");
        result.put("totalAmount", grandTotalExtraCharges);
        result.put("itemCount", totalItemCount);

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getChefAllergies() {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Map<String, Object>> resultList = new ArrayList<>();
        
        List<RoomBooking> activeBookings = roomBookingRepository.findAllActiveBookings();
        
        Set<User> validUsers = new HashSet<>();
        Map<Integer, String> userToRoomMap = new HashMap<>();

        for (RoomBooking b : activeBookings) {
            if (b.getCheckOutDate() != null && !b.getCheckOutDate().toLocalDate().isBefore(today)) {
                User u = b.getUser();
                if (u != null) {
                    validUsers.add(u);
                    if (b.getDetails() != null) {
                        for (RoomBookingDetail detail : b.getDetails()) {
                            if (detail.getRoom() != null) {
                                String roomNum = detail.getRoom().getRoomNumber();
                                String existing = userToRoomMap.get(u.getUserId());
                                if (existing == null) {
                                    userToRoomMap.put(u.getUserId(), roomNum);
                                } else if (!existing.contains(roomNum)) {
                                    userToRoomMap.put(u.getUserId(), existing + ", " + roomNum);
                                }
                            }
                        }
                    }
                }
            }
        }

        for (User u : validUsers) {
            List<FoodOrder> orders = foodOrderRepository.findByUser_UserId(u.getUserId());
            FoodOrder validOrder = null;
            if (orders != null) {
                validOrder = orders.stream()
                    .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()) && 
                                 o.getOrderTime() != null && 
                                 !o.getOrderTime().toLocalDate().isBefore(today) &&
                                 (o.getRoomBooking() == null || 
                                   (!"PENDING".equalsIgnoreCase(o.getRoomBooking().getStatus()) && 
                                    !"PENDING_DEPOSIT".equalsIgnoreCase(o.getRoomBooking().getStatus()) && 
                                    !"CANCELLED".equalsIgnoreCase(o.getRoomBooking().getStatus())))
                           )
                    .min(java.util.Comparator.comparing(FoodOrder::getOrderTime))
                    .orElse(null);
            }

            if (validOrder == null) {
                continue;
            }

            Map<String, Object> guestAllergyMap = new HashMap<>();
            guestAllergyMap.put("userId", u.getUserId());
            guestAllergyMap.put("fullName", u.getFullName());
            guestAllergyMap.put("email", u.getEmail());
            guestAllergyMap.put("phone", u.getPhone());
            guestAllergyMap.put("room", userToRoomMap.getOrDefault(u.getUserId(), "N/A"));
            guestAllergyMap.put("checkIn", validOrder.getOrderTime().toLocalDate().toString());

            MedicalProfile mp = medicalProfileRepository.findByUser_UserId(u.getUserId()).orElse(null);
            String readableAllergies = "Không có";
            String dietaryPreference = "Healthy";
            String decryptedAllergies = "";

            if (mp != null) {
                try {
                    decryptedAllergies = AESUtil.decrypt(mp.getFoodAllergiesEncrypted());
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(decryptedAllergies);
                    List<String> list = new ArrayList<>();
                    if (node.has("selected") && node.get("selected").isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode item : node.get("selected")) {
                            String val = item.asText();
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
                    if (decryptedAllergies == null || decryptedAllergies.trim().isEmpty()) {
                        readableAllergies = "Không có";
                    }
                    if (decryptedAllergies != null && (decryptedAllergies.toLowerCase().contains("chay") || decryptedAllergies.toLowerCase().contains("vegan"))) {
                        dietaryPreference = "Vegan";
                    }
                }
                guestAllergyMap.put("allergies", readableAllergies);
                guestAllergyMap.put("dietary", dietaryPreference);

                resultList.add(guestAllergyMap);
            }
        }
        return resultList;
    }

    @Override
    @Transactional
    public Map<String, Object> orderExtra(MealPreselectionDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        RoomBooking booking = roomBookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        Integer packageId = booking.getPackageId();
        List<PackageFoodLimit> limits = (packageId != null) ? packageFoodLimitRepository.findByPackageId(packageId) : Collections.emptyList();
        Map<Integer, Integer> packageLimitMap = limits.stream()
                .collect(Collectors.toMap(l -> l.getFoodMenu().getFoodId(), PackageFoodLimit::getQuantityPerDay));

        RestaurantTable assignedTable = tableAssignmentService.assignTable(2, java.time.LocalDateTime.now());

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

        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> cancelFoodOrder(Integer orderId, String reason) {
        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ăn uống."));

        if (!"PENDING".equalsIgnoreCase(order.getStatus()) && !"PREPARING".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại: " + order.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime serveTime = order.getOrderTime();
        long diffMinutes = java.time.Duration.between(now, serveTime).toMinutes();

        if (diffMinutes < 120) {
            throw new RuntimeException("Đối với đồ ăn, không thể hủy đơn hàng trước giờ phục vụ dưới 2 tiếng.");
        }

        BigDecimal refundAmt = BigDecimal.ZERO;
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        if (diffMinutes >= 240) {
            refundAmt = totalAmount;
        } else {
            refundAmt = totalAmount.multiply(new BigDecimal("0.50")).setScale(2, java.math.RoundingMode.HALF_UP);
        }

        order.setStatus("CANCELLED");
        order.setCancellationReason(reason);
        order.setCancellationTime(now);
        order.setRefundAmount(refundAmt);

        FoodOrder savedOrder = foodOrderRepository.save(order);

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

        return response;
    }

    private boolean checkAllergyKeyword(String content, String... keywords) {
        if (content == null) return false;
        String padded = " " + content.replaceAll("[\\p{Punct}]", " ") + " ";
        for (String kw : keywords) {
            if (kw == null || kw.trim().isEmpty()) continue;
            if (padded.contains(" " + kw.trim().toLowerCase() + " ")) {
                return true;
            }
        }
        return false;
    }
}
