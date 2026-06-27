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
    private final RestaurantTableRepository restaurantTableRepository;
    private final InventoryRepository inventoryRepository;
    private final DishIngredientRepository dishIngredientRepository;
    private final ProcurementRequestRepository procurementRequestRepository;

    public ChefMealController(FoodMenuRepository foodMenuRepository,
            FoodOrderRepository foodOrderRepository,
            FoodOrderDetailRepository foodOrderDetailRepository,
            RoomBookingRepository roomBookingRepository,
            PackageFoodLimitRepository packageFoodLimitRepository,
            InvoiceRepository invoiceRepository,
            RestaurantTableRepository restaurantTableRepository,
            InventoryRepository inventoryRepository,
            DishIngredientRepository dishIngredientRepository,
            ProcurementRequestRepository procurementRequestRepository) {
        this.foodMenuRepository = foodMenuRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderDetailRepository = foodOrderDetailRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.packageFoodLimitRepository = packageFoodLimitRepository;
        this.invoiceRepository = invoiceRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.inventoryRepository = inventoryRepository;
        this.dishIngredientRepository = dishIngredientRepository;
        this.procurementRequestRepository = procurementRequestRepository;
    }

    @GetMapping("/tables")
    public ResponseEntity<?> getTables() {
        List<RestaurantTable> tablesData = restaurantTableRepository.findAll();
        List<Map<String, Object>> tables = tablesData.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getTableNumber());
            map.put("status", t.getStatus()); 
            map.put("capacity", t.getCapacity());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(tables);
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
            String category = item.getCategory() != null ? item.getCategory() : "Món chính";
            map.put("category", category);
            map.put("ingredients",
                    item.getIngredients() != null ? item.getIngredients() : "Thành phần dinh dưỡng tự nhiên");
            String allergensStr = item.getAllergens() != null ? item.getAllergens() : "";
            map.put("allergens", Arrays.stream(allergensStr.split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(Collectors.toList()));
            map.put("isTodayMenu", item.getIsTodayMenu() != null ? item.getIsTodayMenu() : true);
            map.put("availableDays", item.getAvailableDays() != null ? item.getAvailableDays() : "0,1,2,3,4,5,6");
            map.put("soldOut", item.getSoldOut() != null ? item.getSoldOut() : false);
            map.put("enabled", item.getEnabled() != null ? item.getEnabled() : true);
            map.put("enabled", item.getEnabled() != null ? item.getEnabled() : true);
            map.put("image", item.getImageUrl() != null ? item.getImageUrl() : "/images/dishes/dish_chao_yen_mach.png");
            map.put("isPackageIncluded", item.getIsPackageIncluded() != null ? item.getIsPackageIncluded() : true);
            map.put("periods", Arrays.stream((item.getPeriods() != null ? item.getPeriods() : "Lunch").split(",")).map(String::trim).collect(Collectors.toList()));
            map.put("dietaryTags", item.getDietaryTags() != null ? item.getDietaryTags() : "");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/menu/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String frontendDir = "d:/su26-swp391-se2023-g3/05-Development/frontend/public/images/dishes/";
            java.io.File dir = new java.io.File(frontendDir);
            if (!dir.exists()) dir.mkdirs();
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            java.io.File dest = new java.io.File(dir, filename);
            file.transferTo(dest);
            return ResponseEntity.ok(Map.of("success", true, "imageUrl", "/images/dishes/" + filename));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
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

            String dietaryTags = (String) payload.get("dietaryTags");
            if (dietaryTags == null) {
                dietaryTags = "";
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
                    .category(category)
                    .allergens(allergensStr)
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

            String dietaryTags = (String) payload.get("dietaryTags");
            if (dietaryTags == null) {
                dietaryTags = "";
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
            dish.setCategory(category);
            dish.setAllergens(allergensStr);
            dish.setDietaryTags(dietaryTags);
            dish.setIngredients(ingredients != null ? ingredients : "");
            dish.setIsTodayMenu(isTodayMenu);
            if (availableDays != null) {
                dish.setAvailableDays(availableDays);
            }
            if (imageUrl != null && !imageUrl.isEmpty()) {
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
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String date) {
        java.time.LocalDate targetDate = java.time.LocalDate.now();
        if (date != null && !date.trim().isEmpty()) {
            try {
                targetDate = java.time.LocalDate.parse(date);
            } catch (Exception e) {
                // Ignore and use today
            }
        }
        final java.time.LocalDate finalDate = targetDate;
        
        List<FoodOrder> orders = foodOrderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && o.getOrderTime().toLocalDate().equals(finalDate))
                // Tab 4 KDS: chỉ hiện đơn gọi thêm tại bàn (ROOM SERVICE)
                .filter(o -> !"PACKAGE MEAL".equals(o.getOrigin()))
                .collect(Collectors.toList());
        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<FoodOrderDetail> details = foodOrderDetailRepository.findByFoodOrder_OrderId(order.getOrderId());
            if (details == null || details.isEmpty()) return null;

            Map<String, Object> map = new HashMap<>();
            map.put("id", "ORD-" + order.getOrderId());
            map.put("orderId", order.getOrderId());
            map.put("guestName", order.getUser() != null ? order.getUser().getFullName() : "Khách Vãng Lai");

            // Resolve Table Number
            String tableNumber = "N/A";
            if (order.getTable() != null) {
                tableNumber = order.getTable().getTableNumber();
            }
            if (order.getRoomBooking() != null) {
                map.put("mealCode", String.format("MEAL-%04d", order.getRoomBooking().getBookingId()));
            } else if (order.getTable() != null) {
                map.put("mealCode", "TABLE-" + order.getTable().getTableId());
            } else {
                map.put("mealCode", "GUEST");
            }
            map.put("room", tableNumber); // Keep "room" key for frontend compatibility if needed
            map.put("tableNumber", tableNumber);
            map.put("origin", order.getOrigin() != null ? order.getOrigin() : (order.getRoomBooking() != null ? "ROOM SERVICE" : "RESTAURANT"));

            // Map order items details
            List<Map<String, Object>> items = details.stream().map(d -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("foodId", d.getFoodMenu().getFoodId());
                itemMap.put("name", d.getFoodMenu().getDishName());
                itemMap.put("qty", d.getQuantity());
                return itemMap;
            }).collect(Collectors.toList());
            map.put("items", items);

            // Concatenate notes
            // Concatenate notes, filtering out system-generated [Bữa: ...] tags
            String note = details.stream()
                    .map(FoodOrderDetail::getSpecialNote)
                    .filter(n -> n != null && !n.trim().isEmpty())
                    .map(String::trim)
                    .filter(n -> !n.contains("Bữa:") && !n.contains("Bá»¯a:")) // Strip system tags and their mangled versions
                    .distinct()
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
        }).filter(m -> m != null).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/upcoming")
    public ResponseEntity<?> getUpcomingOrders() {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<FoodOrder> orders = foodOrderRepository.findAll().stream()
                // Tab 5: Đơn PACKAGE MEAL (combo, đặt trước bữa ăn) - hôm nay và tương lai
                .filter(o -> o.getOrderTime() != null && !o.getOrderTime().toLocalDate().isBefore(today))
                .filter(o -> o.getOrigin() == null || "PACKAGE MEAL".equals(o.getOrigin()))
                .filter(o -> o.getRoomBooking() == null || (!"PENDING".equalsIgnoreCase(o.getRoomBooking().getStatus()) && !"CANCELLED".equalsIgnoreCase(o.getRoomBooking().getStatus())))
                .collect(Collectors.toList());
        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<FoodOrderDetail> details = foodOrderDetailRepository.findByFoodOrder_OrderId(order.getOrderId());
            if (details == null || details.isEmpty()) return null;

            Map<String, Object> map = new HashMap<>();
            map.put("id", "ORD-" + order.getOrderId());
            map.put("orderId", order.getOrderId());
            map.put("guestName", order.getUser() != null ? order.getUser().getFullName() : "Khách Vãng Lai");

            String tableNumber = "N/A";
            if (order.getTable() != null) {
                tableNumber = order.getTable().getTableNumber();
            }
            if (order.getRoomBooking() != null) {
                map.put("mealCode", String.format("MEAL-%04d", order.getRoomBooking().getBookingId()));
            } else if (order.getTable() != null) {
                map.put("mealCode", "TABLE-" + order.getTable().getTableId());
            } else {
                map.put("mealCode", "GUEST");
            }
            map.put("room", tableNumber); // Keep "room" key for frontend compatibility
            map.put("tableNumber", tableNumber);
            map.put("origin", order.getOrigin() != null ? order.getOrigin() : "PACKAGE MEAL");
            
            List<Map<String, Object>> items = details.stream().map(d -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("foodId", d.getFoodMenu().getFoodId());
                itemMap.put("name", d.getFoodMenu().getDishName());
                itemMap.put("qty", d.getQuantity());

                String assignedPeriod = "";
                String dNote = d.getSpecialNote();
                if (dNote != null) {
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\[(?:Period|Bữa|Bá»¯a|B.*?a):\\s*([^,\\]]+)").matcher(dNote);
                    if (m.find()) {
                        assignedPeriod = m.group(1).trim();
                    }
                }

                if (!assignedPeriod.isEmpty()) {
                    itemMap.put("periods", assignedPeriod);
                } else {
                    itemMap.put("periods", d.getFoodMenu().getPeriods());
                }

                return itemMap;
            }).collect(Collectors.toList());
            map.put("items", items);

            String note = details.stream()
                    .map(FoodOrderDetail::getSpecialNote)
                    .filter(n -> n != null && !n.trim().isEmpty())
                    .map(n -> n.replaceAll("\\[(?:Period|B[^\\]]+)\\]", "").trim())
                    .filter(n -> !n.isEmpty())
                    .distinct()
                    .collect(Collectors.joining("; "));
            map.put("note", note);

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

            map.put("date", order.getOrderTime().toLocalDate().toString());
            map.put("time", order.getOrderTime().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM")));
            
            // Determine period intelligently for combos
            boolean hasBreakfast = false;
            boolean hasLunch = false;
            boolean hasDinner = false;
            for(FoodOrderDetail d : details) {
                String p = d.getFoodMenu().getPeriods();
                if(p != null) {
                    if(p.toLowerCase().contains("breakfast")) hasBreakfast = true;
                    if(p.toLowerCase().contains("lunch")) hasLunch = true;
                    if(p.toLowerCase().contains("dinner")) hasDinner = true;
                }
            }
            int pCount = (hasBreakfast ? 1 : 0) + (hasLunch ? 1 : 0) + (hasDinner ? 1 : 0);

            String period = "Sáng";
            if (pCount > 1 || (order.getOrigin() != null && order.getOrigin().equals("PACKAGE MEAL") && details.size() > 5)) {
                period = "Cả ngày";
            } else {
                int hour = order.getOrderTime().getHour();
                if (hour >= 10 && hour < 14) {
                    period = "Trưa";
                } else if (hour >= 14) {
                    period = "Tối";
                }
            }
            map.put("period", period);
            
            return map;
        }).filter(m -> m != null).collect(Collectors.toList());
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

        // Deduct inventory when DELIVERED
        if ("DELIVERED".equals(dbStatus)) {
            List<FoodOrderDetail> orderItems = foodOrderDetailRepository.findByFoodOrder_OrderId(order.getOrderId());
            for (FoodOrderDetail item : orderItems) {
                if (item.getFoodMenu() != null) {
                    List<DishIngredient> recipe = dishIngredientRepository.findByFoodMenu_FoodId(item.getFoodMenu().getFoodId());
                    for (DishIngredient ingredient : recipe) {
                        Inventory inv = ingredient.getInventory();
                        double quantityInKg = (ingredient.getAmountInGrams() * item.getQuantity()) / 1000.0;
                        inv.setStock(inv.getStock() - quantityInKg);
                        if (inv.getStock() < 0) {
                            inv.setStock(0.0); // Prevent negative stock
                        }
                        inventoryRepository.save(inv);
                    }
                }
            }
        }

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

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory() {
        List<Inventory> inventoryList = inventoryRepository.findAll().stream()
                .filter(inv -> inv.getCategory() != null && inv.getCategory().contains("Bếp"))
                .filter(inv -> inv.getUnit() != null && inv.getUnit().equalsIgnoreCase("Kg"))
                .collect(Collectors.toList());
        List<Map<String, Object>> response = inventoryList.stream().map(inv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("name", inv.getName());
            map.put("category", inv.getCategory());
            map.put("stock", inv.getStock());
            map.put("minQty", inv.getMinQty());
            map.put("unit", inv.getUnit());
            
            String status = "Đầy đủ";
            if (inv.getStock() == null || inv.getStock() == 0) status = "Hết hàng";
            else if (inv.getStock() < inv.getMinQty()) status = "Sắp hết";
            map.put("status", status);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryStock(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Optional<Inventory> invOpt = inventoryRepository.findById(id);
        if (invOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Inventory not found");
        }
        try {
            Inventory inv = invOpt.get();
            if (payload.containsKey("stock")) {
                inv.setStock(Double.parseDouble(payload.get("stock").toString()));
            }
            if (payload.containsKey("minQty")) {
                inv.setMinQty(Double.parseDouble(payload.get("minQty").toString()));
            }
            inventoryRepository.save(inv);
            return ResponseEntity.ok(Map.of("success", true, "inventory", inv));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update inventory: " + e.getMessage());
        }
    }

    @GetMapping("/procurements")
    public ResponseEntity<?> getProcurements() {
        List<ProcurementRequest> requests = procurementRequestRepository.findAllByOrderByRequestDateDesc().stream()
                .filter(req -> req.getInventory() != null 
                            && req.getInventory().getCategory() != null 
                            && req.getInventory().getCategory().contains("Bếp")
                            && "Kg".equalsIgnoreCase(req.getInventory().getUnit()))
                .collect(Collectors.toList());
        List<Map<String, Object>> response = requests.stream().map(req -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", "REQ-" + req.getId());
            map.put("dbId", req.getId());
            map.put("name", req.getInventory() != null ? req.getInventory().getName() : "Unknown");
            map.put("qty", req.getQty());
            map.put("unit", req.getInventory() != null ? req.getInventory().getUnit() : "Kg");
            map.put("date", req.getRequestDate().toString());
            map.put("status", req.getStatus());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/procurements")
    public ResponseEntity<?> createProcurementRequest(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            Double qty = Double.parseDouble(payload.get("qty").toString());
            
            // Find inventory by name (since frontend sends name)
            Optional<Inventory> invOpt = inventoryRepository.findAll().stream()
                .filter(i -> i.getName().equalsIgnoreCase(name))
                .findFirst();
                
            if (invOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Inventory item not found");
            }
            
            ProcurementRequest request = ProcurementRequest.builder()
                .inventory(invOpt.get())
                .qty(qty)
                .requestDate(java.time.LocalDate.now())
                .status("Chờ duyệt")
                .build();
                
            procurementRequestRepository.save(request);
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", "REQ-" + request.getId());
            map.put("name", request.getInventory().getName());
            map.put("qty", request.getQty());
            map.put("unit", request.getInventory().getUnit());
            map.put("date", request.getRequestDate().toString());
            map.put("status", request.getStatus());
            
            return ResponseEntity.ok(Map.of("success", true, "request", map));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create procurement: " + e.getMessage());
        }
    }

    @PutMapping("/procurements/{id}/approve")
    public ResponseEntity<?> approveProcurement(@PathVariable Integer id) {
        Optional<ProcurementRequest> reqOpt = procurementRequestRepository.findById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Request not found");
        }
        
        ProcurementRequest req = reqOpt.get();
        if ("Đã nhập kho".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Request already approved");
        }
        
        req.setStatus("Đã nhập kho");
        procurementRequestRepository.save(req);
        
        // Add to inventory
        Inventory inv = req.getInventory();
        inv.setStock(inv.getStock() + req.getQty());
        inventoryRepository.save(inv);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Approved successfully"));
    }
}
