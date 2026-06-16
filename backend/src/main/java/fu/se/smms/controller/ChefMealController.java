package fu.se.smms.controller;

import fu.se.smms.entity.*;
import fu.se.smms.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chef")
public class ChefMealController {

    private final FoodMenuRepository foodMenuRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final FoodOrderDetailRepository foodOrderDetailRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final PackageFoodLimitRepository packageFoodLimitRepository;
    private final InvoiceRepository invoiceRepository;

    public ChefMealController(FoodMenuRepository foodMenuRepository,
            FoodOrderRepository foodOrderRepository,
            FoodOrderDetailRepository foodOrderDetailRepository,
            RoomBookingRepository roomBookingRepository,
            PackageFoodLimitRepository packageFoodLimitRepository,
            InvoiceRepository invoiceRepository) {
        this.foodMenuRepository = foodMenuRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderDetailRepository = foodOrderDetailRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.packageFoodLimitRepository = packageFoodLimitRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/menu")
    public ResponseEntity<?> getMenu() {
        List<FoodMenu> menuList = foodMenuRepository.findAll();
        List<Map<String, Object>> response = menuList.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", "DSH-" + String.format("%02d", item.getFoodId()));
            map.put("foodId", item.getFoodId());
            map.put("name", item.getDishName());
            map.put("description", item.getDescription());
            // Return raw price number for calculations in BookingPage
            map.put("price", item.getPrice());

            String tags = item.getDietaryTags() != null ? item.getDietaryTags() : "";
            String category = "Món chính";
            if (tags.toLowerCase().contains("juice") || tags.toLowerCase().contains("khai vị")
                    || tags.toLowerCase().contains("appetizer")) {
                category = "Khai vị";
            } else if (tags.toLowerCase().contains("tráng miệng") || tags.toLowerCase().contains("dessert")) {
                category = "Tráng miệng";
            } else if (tags.toLowerCase().contains("nước") || tags.toLowerCase().contains("thức uống")
                    || tags.toLowerCase().contains("drink") || tags.toLowerCase().contains("beverage")) {
                category = "Thức uống";
            } else if (tags.toLowerCase().contains("món chính") || tags.toLowerCase().contains("main")) {
                category = "Món chính";
            }
            map.put("category", category);
            map.put("ingredients",
                    item.getIngredients() != null ? item.getIngredients() : "Thành phần dinh dưỡng tự nhiên");
            map.put("allergens", Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(t -> t.equalsIgnoreCase("Peanut") || t.equalsIgnoreCase("Seafood")
                            || t.equalsIgnoreCase("Cay")
                            || t.equalsIgnoreCase("Đậu phộng") || t.equalsIgnoreCase("Hải sản")
                            || t.equalsIgnoreCase("Ớt"))
                    .map(t -> {
                        if (t.equalsIgnoreCase("Peanut") || t.equalsIgnoreCase("Đậu phộng"))
                            return "Đậu phộng";
                        if (t.equalsIgnoreCase("Seafood") || t.equalsIgnoreCase("Hải sản"))
                            return "Hải sản";
                        return "Cay";
                    })
                    .collect(Collectors.toList()));
            map.put("isTodayMenu", item.getIsTodayMenu() != null ? item.getIsTodayMenu() : true);
            map.put("availableDays", item.getAvailableDays() != null ? item.getAvailableDays() : "0,1,2,3,4,5,6");
            map.put("soldOut", item.getSoldOut() != null ? item.getSoldOut() : false);
            map.put("enabled", item.getEnabled() != null ? item.getEnabled() : true);
            map.put("enabled", item.getEnabled() != null ? item.getEnabled() : true);
            map.put("image", item.getImageUrl() != null ? item.getImageUrl() : "/images/dishes/dish_chao_yen_mach.png");
            map.put("isPackageIncluded", item.getIsPackageIncluded() != null ? item.getIsPackageIncluded() : true);
            map.put("periods", Arrays.stream((item.getPeriods() != null ? item.getPeriods() : "Lunch").split(",")).map(String::trim).collect(Collectors.toList()));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/menu/{id}/toggle-sold-out")
    public ResponseEntity<?> toggleSoldOut(@PathVariable Integer id) {
        Optional<FoodMenu> menuOpt = foodMenuRepository.findById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Dish not found");
        }
        FoodMenu dish = menuOpt.get();
        dish.setSoldOut(!Boolean.TRUE.equals(dish.getSoldOut()));
        foodMenuRepository.save(dish);
        return ResponseEntity.ok(Map.of("success", true, "soldOut", dish.getSoldOut()));
    }

    @PutMapping("/menu/{id}/toggle-today")
    public ResponseEntity<?> toggleTodayMenu(@PathVariable Integer id) {
        Optional<FoodMenu> menuOpt = foodMenuRepository.findById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Dish not found");
        }
        FoodMenu dish = menuOpt.get();
        dish.setIsTodayMenu(!Boolean.TRUE.equals(dish.getIsTodayMenu()));
        foodMenuRepository.save(dish);
        return ResponseEntity.ok(Map.of("success", true, "isTodayMenu", dish.getIsTodayMenu()));
    }

    @PutMapping("/menu/{id}/toggle-enabled")
    public ResponseEntity<?> toggleEnabled(@PathVariable Integer id) {
        Optional<FoodMenu> menuOpt = foodMenuRepository.findById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Dish not found");
        }
        FoodMenu dish = menuOpt.get();
        dish.setEnabled(!Boolean.TRUE.equals(dish.getEnabled()));
        foodMenuRepository.save(dish);
        return ResponseEntity.ok(Map.of("success", true, "enabled", dish.getEnabled()));
    }

    private BigDecimal parsePrice(String priceStr) {
        if (priceStr == null)
            return BigDecimal.ZERO;
        String clean = priceStr.replaceAll("[^\\d]", "");
        if (clean.isEmpty())
            return BigDecimal.ZERO;
        return new BigDecimal(clean);
    }

    @PostMapping("/menu")
    public ResponseEntity<?> addDish(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            String priceStr = String.valueOf(payload.get("price"));
            String category = (String) payload.get("category");
            String ingredients = (String) payload.get("ingredients");

            Object allergensObj = payload.get("allergens");
            String allergensStr = "";
            if (allergensObj instanceof List) {
                allergensStr = String.join(", ", (List<String>) allergensObj);
            } else if (allergensObj instanceof String) {
                allergensStr = (String) allergensObj;
            }

            Boolean isTodayMenu = payload.get("isTodayMenu") != null ? (Boolean) payload.get("isTodayMenu") : true;
            Boolean enabled = payload.get("enabled") != null ? (Boolean) payload.get("enabled") : true;

            String dietaryTags = category != null ? category : "Món chính";
            if (allergensStr != null && !allergensStr.trim().isEmpty()) {
                dietaryTags += ", " + allergensStr;
            }

            BigDecimal price = parsePrice(priceStr);

            String availableDays = (String) payload.get("availableDays");
            String imageUrl = (String) payload.get("image");
            Boolean isPackageIncluded = payload.get("isPackageIncluded") != null ? (Boolean) payload.get("isPackageIncluded") : true;
            
            Object periodsObj = payload.get("period"); // from Chef UI
            if (periodsObj == null) periodsObj = payload.get("periods");
            String periods = periodsObj instanceof List ? String.join(",", (List<String>) periodsObj) : (String) periodsObj;

            FoodMenu dish = FoodMenu.builder()
                    .dishName(name)
                    .description(description)
                    .price(price)
                    .dietaryTags(dietaryTags)
                    .ingredients(ingredients)
                    .isTodayMenu(isTodayMenu)
                    .availableDays(availableDays != null ? availableDays : "0,1,2,3,4,5,6")
                    .imageUrl(imageUrl)
                    .isPackageIncluded(isPackageIncluded)
                    .periods(periods)
                    .enabled(enabled)
                    .soldOut(false)
                    .build();

            foodMenuRepository.save(dish);
            return ResponseEntity.ok(Map.of("success", true, "dish", dish));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add dish: " + e.getMessage());
        }
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<?> updateDish(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        Optional<FoodMenu> dishOpt = foodMenuRepository.findById(id);
        if (dishOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Dish not found");
        }
        try {
            FoodMenu dish = dishOpt.get();
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            String priceStr = String.valueOf(payload.get("price"));
            String category = (String) payload.get("category");
            String ingredients = (String) payload.get("ingredients");

            Object allergensObj = payload.get("allergens");
            String allergensStr = "";
            if (allergensObj instanceof List) {
                allergensStr = String.join(", ", (List<String>) allergensObj);
            } else if (allergensObj instanceof String) {
                allergensStr = (String) allergensObj;
            }

            Boolean isTodayMenu = payload.get("isTodayMenu") != null ? (Boolean) payload.get("isTodayMenu") : true;
            Boolean enabled = payload.get("enabled") != null ? (Boolean) payload.get("enabled") : true;

            String dietaryTags = category != null ? category : "Món chính";
            if (allergensStr != null && !allergensStr.trim().isEmpty()) {
                dietaryTags += ", " + allergensStr;
            }

            BigDecimal price = parsePrice(priceStr);

            String availableDays = (String) payload.get("availableDays");
            String imageUrl = (String) payload.get("image");
            Boolean isPackageIncluded = payload.get("isPackageIncluded") != null ? (Boolean) payload.get("isPackageIncluded") : true;
            
            Object periodsObj = payload.get("period");
            if (periodsObj == null) periodsObj = payload.get("periods");
            String periods = periodsObj instanceof List ? String.join(",", (List<String>) periodsObj) : (String) periodsObj;

            dish.setDishName(name);
            dish.setDescription(description != null ? description : "");
            dish.setPrice(price);
            dish.setDietaryTags(dietaryTags);
            dish.setIngredients(ingredients != null ? ingredients : "");
            dish.setIsTodayMenu(isTodayMenu);
            if (availableDays != null) {
                dish.setAvailableDays(availableDays);
            }
            if (imageUrl != null) {
                dish.setImageUrl(imageUrl);
            }
            dish.setIsPackageIncluded(isPackageIncluded);
            if (periods != null) {
                dish.setPeriods(periods);
            }
            dish.setEnabled(enabled);

            foodMenuRepository.save(dish);
            return ResponseEntity.ok(Map.of("success", true, "dish", dish));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update dish: " + e.getMessage());
        }
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable Integer id) {
        Optional<FoodMenu> dishOpt = foodMenuRepository.findById(id);
        if (dishOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Dish not found");
        }
        try {
            packageFoodLimitRepository.deleteByFoodMenuId(id);
            foodOrderDetailRepository.deleteByFoodMenuId(id);

            foodMenuRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete dish: " + e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<FoodOrder> orders = foodOrderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && o.getOrderTime().toLocalDate().equals(today))
                .collect(Collectors.toList());
        List<Map<String, Object>> response = orders.stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", "ORD-" + order.getOrderId());
            map.put("orderId", order.getOrderId());
            map.put("guestName", order.getUser() != null ? order.getUser().getFullName() : "Khách Vãng Lai");

            // Resolve Room Number
            String roomNumber = "N/A";
            if (order.getRoomBooking() != null) {
                List<String> rooms = roomBookingRepository
                        .findRoomNumbersByBookingId(order.getRoomBooking().getBookingId());
                if (rooms != null && !rooms.isEmpty()) {
                    roomNumber = String.join(", ", rooms);
                }
                map.put("mealCode", "MEAL-" + order.getRoomBooking().getBookingId());
            } else {
                map.put("mealCode", "GUEST");
            }
            map.put("room", roomNumber);
            map.put("origin", order.getRoomBooking() != null ? "Room Service" : "Restaurant");

            // Fetch order items details
            List<FoodOrderDetail> details = foodOrderDetailRepository.findByFoodOrder_OrderId(order.getOrderId());
            List<Map<String, Object>> items = details.stream().map(d -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("foodId", d.getFoodMenu().getFoodId());
                itemMap.put("name", d.getFoodMenu().getDishName());
                itemMap.put("qty", d.getQuantity());
                return itemMap;
            }).collect(Collectors.toList());
            map.put("items", items);

            // Concatenate notes
            String note = details.stream()
                    .map(FoodOrderDetail::getSpecialNote)
                    .filter(n -> n != null && !n.trim().isEmpty())
                    .collect(Collectors.joining("; "));
            map.put("note", note);

            // Map Status: PENDING -> Pending, PREPARING -> Cooking, READY -> Delivering, DELIVERED -> Completed
            String mappedStatus = "Pending";
            if ("PREPARING".equalsIgnoreCase(order.getStatus())) {
                mappedStatus = "Cooking";
            } else if ("READY".equalsIgnoreCase(order.getStatus())) {
                mappedStatus = "Delivering";
            } else if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
                mappedStatus = "Completed";
            } else if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
                mappedStatus = "Cancelled";
            }
            map.put("status", mappedStatus);

            // Formatted time
            String formattedTime = order.getOrderTime().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM"));
            map.put("time", formattedTime);

            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer id, @RequestParam String status) {
        Optional<FoodOrder> orderOpt = foodOrderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Order not found");
        }
        FoodOrder order = orderOpt.get();

        // Translate status back
        String dbStatus = "PENDING";
        if ("Cooking".equalsIgnoreCase(status)) {
            dbStatus = "PREPARING";
        } else if ("Delivering".equalsIgnoreCase(status)) {
            dbStatus = "READY";
        } else if ("Completed".equalsIgnoreCase(status)) {
            dbStatus = "DELIVERED";
        } else if ("Cancelled".equalsIgnoreCase(status)) {
            dbStatus = "CANCELLED";
        }

        order.setStatus(dbStatus);
        foodOrderRepository.save(order);

        // Gap 4: Billing Synchronization. Append total amount to Invoice when DELIVERED
        if ("DELIVERED".equals(dbStatus) && order.getRoomBooking() != null && order.getTotalAmount() != null) {
            Optional<Invoice> invoiceOpt = invoiceRepository.findFirstByRoomBooking_BookingId(order.getRoomBooking().getBookingId());
            if (invoiceOpt.isPresent()) {
                Invoice invoice = invoiceOpt.get();
                BigDecimal orderTotal = order.getTotalAmount();
                invoice.setFoodSubtotal(invoice.getFoodSubtotal() != null ? invoice.getFoodSubtotal().add(orderTotal) : orderTotal);
                
                BigDecimal taxAndFees = invoice.getTaxAndFees() != null ? invoice.getTaxAndFees() : BigDecimal.ZERO;
                BigDecimal roomSubtotal = invoice.getRoomSubtotal() != null ? invoice.getRoomSubtotal() : BigDecimal.ZERO;
                BigDecimal spaSubtotal = invoice.getSpaSubtotal() != null ? invoice.getSpaSubtotal() : BigDecimal.ZERO;
                BigDecimal totalAmount = roomSubtotal.add(spaSubtotal).add(invoice.getFoodSubtotal()).add(taxAndFees);
                
                invoice.setFinalAmount(totalAmount);
                BigDecimal depositAmount = invoice.getDepositAmount() != null ? invoice.getDepositAmount() : BigDecimal.ZERO;
                invoice.setAmountDue(totalAmount.subtract(depositAmount));
                invoiceRepository.save(invoice);
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "status", status));
    }

    @DeleteMapping("/orders/{orderId}/item/{foodId}")
    public ResponseEntity<?> deleteOrderItem(@PathVariable Integer orderId, @PathVariable Integer foodId) {
        Optional<FoodOrder> orderOpt = foodOrderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Order not found");
        }
        FoodOrder order = orderOpt.get();

        List<FoodOrderDetail> details = foodOrderDetailRepository.findByFoodOrder_OrderId(orderId);
        FoodOrderDetail targetDetail = null;
        for (FoodOrderDetail detail : details) {
            if (detail.getFoodMenu() != null && detail.getFoodMenu().getFoodId().equals(foodId)) {
                targetDetail = detail;
                break;
            }
        }

        if (targetDetail == null) {
            return ResponseEntity.status(404).body("Item not found in order");
        }

        // Subtract from totalAmount
        if (Boolean.FALSE.equals(targetDetail.getIsPackageIncluded())) {
            BigDecimal cost = targetDetail.getPriceAtOrder().multiply(new BigDecimal(targetDetail.getQuantity()));
            order.setTotalAmount(order.getTotalAmount().subtract(cost));
        }

        foodOrderDetailRepository.delete(targetDetail);

        // If this was the last item, cancel the order
        if (details.size() == 1) {
            order.setStatus("CANCELLED");
        }
        
        foodOrderRepository.save(order);

        return ResponseEntity.ok(Map.of("success", true, "message", "Item removed successfully"));
    }
}
