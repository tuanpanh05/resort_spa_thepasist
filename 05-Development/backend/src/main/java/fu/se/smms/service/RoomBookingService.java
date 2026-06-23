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
    private final SpaBookingRepository spaBookingRepository;
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
                              SpaBookingRepository spaBookingRepository,
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
        this.spaBookingRepository = spaBookingRepository;
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
        if (dto.getPackageIds() != null && !dto.getPackageIds().isEmpty()) {
            List<RetreatPackage> packages = new ArrayList<>();
            for (Integer pkgId : dto.getPackageIds()) {
                retreatPackageRepository.findById(pkgId).ifPresent(packages::add);
            }
            booking.setRetreatPackages(packages);
        } else if (dto.getPackageId() != null) {
            retreatPackageRepository.findById(dto.getPackageId()).ifPresent(booking::setRetreatPackage);
        }

        // Set check-in and check-out times
        LocalDateTime checkIn = dto.getCheckInDate().toLocalDate().atTime(14, 0, 0);
        LocalDateTime checkOut = dto.getCheckOutDate().toLocalDate().atTime(12, 0, 0);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setStatus("PENDING_DEPOSIT");
        booking.setTotalDeposit(BigDecimal.ZERO);
        
        // 4. Create RoomBookingDetail(s) based on roomTypeQuantities
        List<RoomBookingDetail> details = new ArrayList<>();
        Map<String, Integer> roomTypeQuantities = dto.getRoomTypeQuantities();
        if (roomTypeQuantities == null || roomTypeQuantities.isEmpty()) {
            Integer vId = dto.getVillaId();
            int qty = dto.getRoomQuantity() != null ? dto.getRoomQuantity() : 1;
            if (vId != null) {
                roomTypeQuantities = Map.of(String.valueOf(vId), qty);
            } else {
                roomTypeQuantities = Collections.emptyMap();
            }
        }

        for (Map.Entry<String, Integer> entry : roomTypeQuantities.entrySet()) {
            Integer roomTypeId;
            try {
                roomTypeId = Integer.parseInt(entry.getKey());
            } catch (NumberFormatException e) {
                continue;
            }
            int qty = entry.getValue() != null ? entry.getValue() : 0;
            if (qty < 1) continue;

            List<Room> matchingRooms = roomRepository.findAll().stream()
                    .filter(r -> r.getRoomType() != null && r.getRoomType().getRoomTypeId().equals(roomTypeId))
                    .collect(Collectors.toList());

            List<Room> availableRooms = new ArrayList<>();
            for (Room r : matchingRooms) {
                if (roomBookingRepository.countOverlappingBookings(r.getRoomId(), checkIn, checkOut) == 0) {
                    availableRooms.add(r);
                }
            }

            for (int i = 0; i < qty; i++) {
                Room assignedRoom = null;
                if (!availableRooms.isEmpty()) {
                    assignedRoom = availableRooms.remove(0);
                } else if (!matchingRooms.isEmpty()) {
                    assignedRoom = matchingRooms.get(i % matchingRooms.size());
                } else {
                    List<Room> allRooms = roomRepository.findAll();
                    if (!allRooms.isEmpty()) {
                        assignedRoom = allRooms.get(0);
                    }
                }

                if (assignedRoom != null) {
                    RoomBookingDetail detail = new RoomBookingDetail();
                    detail.setRoomBooking(booking);
                    detail.setRoom(assignedRoom);

                    BigDecimal priceAtBooking = BigDecimal.valueOf(5000000); // Fallback price
                    if (assignedRoom.getRoomType() != null && assignedRoom.getRoomType().getBasePricePerNight() != null) {
                        priceAtBooking = assignedRoom.getRoomType().getBasePricePerNight();
                    }
                    detail.setPriceAtBooking(priceAtBooking);
                    details.add(detail);
                }
            }
        }

        if (details.isEmpty()) {
            List<Room> allRooms = roomRepository.findAll();
            Room fallbackRoom = allRooms.isEmpty() ? null : allRooms.get(0);
            if (fallbackRoom != null) {
                RoomBookingDetail detail = new RoomBookingDetail();
                detail.setRoomBooking(booking);
                detail.setRoom(fallbackRoom);
                detail.setPriceAtBooking(fallbackRoom.getRoomType() != null && fallbackRoom.getRoomType().getBasePricePerNight() != null 
                    ? fallbackRoom.getRoomType().getBasePricePerNight() : BigDecimal.valueOf(5000000));
                details.add(detail);
            }
        }
        booking.setDetails(details);

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
                                .specialNote("[Bá»¯a: " + period + ", NgÃ y: " + dateStr + "]")
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

        // 6. Calculate initial invoice
        try {
            invoiceService.createInvoice(savedBooking.getBookingId());
        } catch (Exception e) {
            System.err.println("[Invoice Calc] Error creating initial invoice: " + e.getMessage());
            e.printStackTrace();
        }

        return savedBooking;
    }

    // ================================================================
    // Guest Booking Lookup & Update (Public â€“ no auth required)
    // ================================================================

    /**
     * Lookup bookings by guest email + phone (public endpoint).
     */
    @Transactional(readOnly = true)
    public List<RoomBooking> lookupBookings(String email, String phone) {
        if (email == null || email.isBlank() || phone == null || phone.isBlank()) {
            throw new RuntimeException("Vui lòng nhập đầy đủ Email và Số điện thoại.");
        }
        List<RoomBooking> bookings = roomBookingRepository.findByEmailAndPhoneWithFullDetails(email.trim(), phone.trim());
        // Force-initialize lazy associations within the transaction
        // (cannot JOIN FETCH both 'details' and 'retreatPackages' — MultipleBagFetchException)
        for (RoomBooking b : bookings) {
            if (b.getRetreatPackages() != null) {
                b.getRetreatPackages().size(); // trigger lazy load
            }
            if (b.getRetreatPackage() != null) {
                b.getRetreatPackage().getPackageId(); // trigger lazy load for single package
            }
        }
        return bookings;
    }

    /**
     * Update booking details (name, phone, dates) with full validation.
     * Verifies email+phone ownership, checks room overlap, validates activity ranges,
     * and recalculates the invoice automatically.
     */
    @Transactional
    public RoomBooking updateBooking(Integer bookingId, String email, String phone, BookingRequestDTO dto) {
        // 1. Verify ownership via email + phone
        RoomBooking booking = roomBookingRepository.findByIdWithFullDetails(bookingId)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y Ä‘áº·t phÃ²ng vá»›i ID: " + bookingId));

        User user = booking.getUser();
        if (user == null || !email.equalsIgnoreCase(user.getEmail()) || !phone.equals(user.getPhone())) {
            throw new RuntimeException("ThÃ´ng tin Email hoáº·c Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng khá»›p vá»›i Ä‘Æ¡n Ä‘áº·t phÃ²ng nÃ y.");
        }

        // 2. Update guest name/phone if provided
        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone());
        }
        userRepository.save(user);

        // 3. Update dates if provided
        if (dto.getCheckInDate() != null && dto.getCheckOutDate() != null) {
            LocalDateTime newCheckIn = dto.getCheckInDate().toLocalDate().atTime(14, 0, 0);
            LocalDateTime newCheckOut = dto.getCheckOutDate().toLocalDate().atTime(12, 0, 0);

            if (!newCheckOut.isAfter(newCheckIn)) {
                throw new RuntimeException("NgÃ y tráº£ phÃ²ng pháº£i sau ngÃ y nháº­n phÃ²ng.");
            }

            // 3a. Check room overlap (BR-09) â€“ exclude current booking
            List<RoomBookingDetail> details = booking.getDetails();
            if (details != null) {
                for (RoomBookingDetail det : details) {
                    int overlap = roomBookingRepository.countOverlappingBookingsForUpdate(
                            det.getRoom().getRoomId(), bookingId, newCheckIn, newCheckOut);
                    if (overlap > 0) {
                        throw new RuntimeException("PhÃ²ng " + det.getRoom().getRoomNumber()
                                + " Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t trong khoáº£ng thá»i gian nÃ y. Vui lÃ²ng chá»n ngÃ y khÃ¡c.");
                    }
                }
            }

            // 3b. Validate existing Spa bookings fall within new stay range (ITINERARY-001)
            try {
                List<SpaBooking> spaBookings = spaBookingRepository.findByRoomBookingId(bookingId);
                for (SpaBooking spa : spaBookings) {
                    if (spa.getStartDatetime() != null) {
                        if (spa.getStartDatetime().isBefore(newCheckIn) || spa.getStartDatetime().isAfter(newCheckOut)) {
                            throw new RuntimeException("KhÃ´ng thá»ƒ thay Ä‘á»•i ngÃ y: Lá»‹ch háº¹n Spa '"
                                    + (spa.getSpaService() != null ? spa.getSpaService().getName() : "")
                                    + "' náº±m ngoÃ i khoáº£ng thá»i gian lÆ°u trÃº má»›i.");
                        }
                    }
                }
            } catch (RuntimeException e) {
                throw e; // re-throw our validation errors
            } catch (Exception ignored) {
                // spa data unavailable â€“ skip validation
            }

            // 3c. Validate existing Food orders fall within new stay range
            try {
                List<Object[]> foodOrders = roomBookingRepository.findFoodOrdersForTimeline(bookingId);
                for (Object[] row : foodOrders) {
                    Object rawTime = row[1];
                    LocalDateTime orderTime = null;
                    if (rawTime instanceof LocalDateTime) {
                        orderTime = (LocalDateTime) rawTime;
                    } else if (rawTime instanceof java.sql.Timestamp) {
                        orderTime = ((java.sql.Timestamp) rawTime).toLocalDateTime();
                    }
                    if (orderTime != null && (orderTime.isBefore(newCheckIn) || orderTime.isAfter(newCheckOut))) {
                        throw new RuntimeException("KhÃ´ng thá»ƒ thay Ä‘á»•i ngÃ y: CÃ³ Ä‘Æ¡n gá»i mÃ³n náº±m ngoÃ i khoáº£ng thá»i gian lÆ°u trÃº má»›i.");
                    }
                }
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception ignored) {
                // food data unavailable â€“ skip validation
            }

            booking.setCheckInDate(newCheckIn);
            booking.setCheckOutDate(newCheckOut);
        }

        // 3d. Update package if provided
        boolean packageChanged = false;
        if (dto.getPackageIds() != null && !dto.getPackageIds().isEmpty()) {
            List<RetreatPackage> packages = new ArrayList<>();
            for (Integer pkgId : dto.getPackageIds()) {
                retreatPackageRepository.findById(pkgId).ifPresent(packages::add);
            }
            booking.setRetreatPackages(packages);
            packageChanged = true;
        } else if (dto.getPackageId() != null) {
            Optional<RetreatPackage> pkgOpt = retreatPackageRepository.findById(dto.getPackageId());
            if (pkgOpt.isPresent()) {
                booking.setRetreatPackage(pkgOpt.get());
                packageChanged = true;
            }
        }

        RoomBooking saved = roomBookingRepository.save(booking);

        // 4. Recalculate invoice if dates or package changed
        if ((dto.getCheckInDate() != null && dto.getCheckOutDate() != null) || packageChanged) {
            try {
                invoiceService.createInvoice(bookingId);
            } catch (Exception ignored) {
                // Invoice recalculation failure is non-fatal
            }
        }

        return saved;
    }
}
