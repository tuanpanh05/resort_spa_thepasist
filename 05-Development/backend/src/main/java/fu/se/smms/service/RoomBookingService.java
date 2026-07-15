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
    private final InvoiceRepository invoiceRepository;
    private final RoomBookingDetailRepository roomBookingDetailRepository;
    private final SystemConfigurationRepository systemConfigurationRepository;
    private final TableAssignmentService tableAssignmentService;
    private final TreatmentRoomRepository treatmentRoomRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private fu.se.smms.repository.SpaServiceRepository spaServiceRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private fu.se.smms.service.SpaBookingService spaBookingService;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired
    private AccompanyingGuestRepository accompanyingGuestRepository;

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
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository,
            RoomBookingDetailRepository roomBookingDetailRepository,
            SystemConfigurationRepository systemConfigurationRepository,
            TableAssignmentService tableAssignmentService,
            TreatmentRoomRepository treatmentRoomRepository) {
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
        this.invoiceRepository = invoiceRepository;
        this.roomBookingDetailRepository = roomBookingDetailRepository;
        this.systemConfigurationRepository = systemConfigurationRepository;
        this.tableAssignmentService = tableAssignmentService;
        this.treatmentRoomRepository = treatmentRoomRepository;
    }

    @Transactional
    public RoomBooking createBooking(BookingRequestDTO dto) {
        // 1. Get or create user
        User user = userRepository.findByEmail(dto.getEmail()).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .phone(dto.getPhone())
                    .idPassportEncrypted(dto.getIdentityDocument())
                    .role("GUEST")
                    .status("ACTIVE")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .build();
            user = userRepository.save(user);
        } else {
            // Update identity document if not set yet
            if ((user.getIdPassportEncrypted() == null || user.getIdPassportEncrypted().isBlank()) && dto.getIdentityDocument() != null) {
                user.setIdPassportEncrypted(dto.getIdentityDocument());
                user = userRepository.save(user);
            }
        }

        // 2. Update Medical Profile
        Optional<MedicalProfile> profileOpt = medicalProfileRepository.findByUser_UserId(user.getUserId());
        MedicalProfile profile;
        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
        } else {
            profile = new MedicalProfile();
            profile.setUser(user);
        }
        
        profile.setExplicitConsentSigned(dto.getExplicitConsentSigned() != null ? dto.getExplicitConsentSigned() : false);
        if (dto.getAllergies() != null) {
            profile.setFoodAllergiesEncrypted(dto.getAllergies()); // using setter that encrypts
        }
        profile.setUpdatedAt(LocalDateTime.now());
        medicalProfileRepository.save(profile);

        // 3. Create RoomBooking
        RoomBooking booking = new RoomBooking();
        booking.setUser(user);
        booking.setSpecialRequests(dto.getSpecialRequests());
        // BR-CHILD: Trẻ 5-12 tính vào 1 slot người lớn, trẻ dưới 5 không tính
        int actualAdults = dto.getGuestsCount() != null ? dto.getGuestsCount() : 1;
        int actualUnder5 = dto.getChildrenUnder5() != null ? dto.getChildrenUnder5() : 0;
        int actual5to12 = dto.getChildren5to12() != null ? dto.getChildren5to12() : 0;
        booking.setGuestsCount(actualAdults + actual5to12);
        booking.setChildrenUnder5(actualUnder5);
        booking.setChildren5to12(actual5to12);
        booking.setChildrenCount(actualUnder5 + actual5to12);
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
        if (dto.getIdentityDocument() != null && !dto.getIdentityDocument().isBlank()) {
            booking.setStatus("CONFIRMED");
        } else {
            booking.setStatus("PENDING_DEPOSIT");
        }
        booking.setTotalDeposit(BigDecimal.ZERO);
        // 4. Create RoomBookingDetail(s)
        List<RoomBookingDetail> details = new ArrayList<>();

        // 4a. If specific roomIds provided (walk-in staff selection), assign those exact rooms
        if (dto.getRoomIds() != null && !dto.getRoomIds().isEmpty()) {
            for (Integer specificRoomId : dto.getRoomIds()) {
                Room room = roomRepository.findById(specificRoomId).orElse(null);
                if (room != null) {
                    RoomBookingDetail detail = new RoomBookingDetail();
                    detail.setRoomBooking(booking);
                    detail.setRoom(room);
                    BigDecimal priceAtBooking = BigDecimal.valueOf(5000000);
                    if (room.getRoomType() != null && room.getRoomType().getBasePricePerNight() != null) {
                        priceAtBooking = room.getRoomType().getBasePricePerNight();
                    }
                    detail.setPriceAtBooking(priceAtBooking);
                    details.add(detail);
                }
            }
        } else {
        // 4b. Fallback: use roomTypeQuantities (online booking flow)
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
            if (qty < 1)
                continue;

            List<Room> matchingRooms = roomRepository.findAll().stream()
                    .filter(r -> r.getRoomType() != null && r.getRoomType().getRoomTypeId().equals(roomTypeId))
                    .collect(Collectors.toList());

            List<Room> availableRooms = new ArrayList<>();
            for (Room r : matchingRooms) {
                boolean isBookable = "AVAILABLE".equalsIgnoreCase(r.getStatus());
                if (isBookable
                        && roomBookingRepository.countOverlappingBookings(r.getRoomId(), checkIn, checkOut) == 0) {
                    availableRooms.add(r);
                }
            }

            if (availableRooms.size() < qty) {
                String typeName = (matchingRooms.isEmpty() || matchingRooms.get(0).getRoomType() == null)
                        ? "Hạng phòng yêu cầu"
                        : matchingRooms.get(0).getRoomType().getTypeName();
                throw new fu.se.smms.exception.BusinessException(
                        "BOOKING-004", org.springframework.http.HttpStatus.CONFLICT,
                        "Hạng phòng \"" + typeName
                                + "\" đã hết phòng trống trong khoảng thời gian này. Vui lòng chọn ngày hoặc hạng phòng khác.");
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
                    if (assignedRoom.getRoomType() != null
                            && assignedRoom.getRoomType().getBasePricePerNight() != null) {
                        priceAtBooking = assignedRoom.getRoomType().getBasePricePerNight();
                    }
                    detail.setPriceAtBooking(priceAtBooking);
                    details.add(detail);
                }
            }
        }
        } // end else (roomTypeQuantities fallback)

        if (details.isEmpty()) {
            List<Room> allRooms = roomRepository.findAll();
            Room fallbackRoom = allRooms.isEmpty() ? null : allRooms.get(0);
            if (fallbackRoom != null) {
                RoomBookingDetail detail = new RoomBookingDetail();
                detail.setRoomBooking(booking);
                detail.setRoom(fallbackRoom);
                detail.setPriceAtBooking(
                        fallbackRoom.getRoomType() != null && fallbackRoom.getRoomType().getBasePricePerNight() != null
                                ? fallbackRoom.getRoomType().getBasePricePerNight()
                                : BigDecimal.valueOf(5000000));
                details.add(detail);
            }
        }
        // Validate total capacity of selected rooms against guestsCount + children5to12
        int totalGuests = (dto.getGuestsCount() != null ? dto.getGuestsCount() : 1)
                + (dto.getChildren5to12() != null ? dto.getChildren5to12() : 0);
        int totalCapacity = 0;
        for (RoomBookingDetail detail : details) {
            if (detail.getRoom() != null && detail.getRoom().getRoomType() != null) {
                Integer maxOccupancy = detail.getRoom().getRoomType().getMaxOccupancy();
                totalCapacity += (maxOccupancy != null ? maxOccupancy : 2);
            } else {
                totalCapacity += 2;
            }
        }

        if (totalGuests > totalCapacity) {
            throw new fu.se.smms.exception.BusinessException(
                    "BOOKING-005", org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Tổng sức chứa của các biệt thự/phòng đã chọn (" + totalCapacity 
                    + " người) không đủ đáp ứng số lượng khách lưu trú (" + totalGuests + " người).");
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
                        .origin("PACKAGE MEAL")
                        .table(null)
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

                        if (qty == null || qty <= 0)
                            continue;

                        Optional<FoodMenu> menuOpt = foodMenuRepository.findById(foodId);
                        if (menuOpt.isEmpty())
                            continue;
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
                                .specialNote("[Period: " + period + ", Date: " + dateStr + "]")
                                .isPackageIncluded(isPackageIncluded)
                                .build();

                        detailsToSave.add(detail);
                    }
                }

                 foodOrderDetailRepository.saveAll(detailsToSave);

                 BigDecimal orderTotal = totalExtraCharges;
                 if (dto.getSelectedComboId() != null && !dto.getSelectedComboId().isBlank()) {
                     double dailyComboPrice = 0.0;
                     if ("detox".equalsIgnoreCase(dto.getSelectedComboId())) {
                         dailyComboPrice = 150000.0;
                     } else if ("recovery".equalsIgnoreCase(dto.getSelectedComboId())) {
                         dailyComboPrice = 200000.0;
                     } else if ("vip".equalsIgnoreCase(dto.getSelectedComboId())) {
                         dailyComboPrice = 450000.0;
                     }
                     
                     int totalGuestsCount = (dto.getGuestsCount() != null ? dto.getGuestsCount() : 0)
                             + (dto.getChildrenUnder5() != null ? dto.getChildrenUnder5() : 0)
                             + (dto.getChildren5to12() != null ? dto.getChildren5to12() : 0);
                     if (totalGuestsCount <= 0) totalGuestsCount = 1;

                     orderTotal = BigDecimal.valueOf(dailyComboPrice).multiply(BigDecimal.valueOf(totalGuestsCount));
                 }

                 foodOrder.setTotalAmount(orderTotal);
                 foodOrderRepository.save(foodOrder);
            }
        }

        // 5b. Save primary guest and accompanying guests to database if identityDocument is present
        if (dto.getIdentityDocument() != null && !dto.getIdentityDocument().isBlank()) {
            AccompanyingGuest mainGuestObj = new AccompanyingGuest();
            mainGuestObj.setBookingId(savedBooking.getBookingId());
            mainGuestObj.setFullName(savedBooking.getUser().getFullName());
            mainGuestObj.setIdentityDocument(dto.getIdentityDocument().trim());
            mainGuestObj.setRelationship("Người đăng ký");
            mainGuestObj.setIsChild(false);
            accompanyingGuestRepository.save(mainGuestObj);
 
            if (dto.getAccompanyingGuests() != null && !dto.getAccompanyingGuests().isEmpty()) {
                for (fu.se.smms.dto.AccompanyingGuestDTO gDto : dto.getAccompanyingGuests()) {
                    if (gDto.getFullName() == null || gDto.getFullName().isBlank()) continue;
                    AccompanyingGuest guestObj = new AccompanyingGuest();
                    guestObj.setBookingId(savedBooking.getBookingId());
                    guestObj.setFullName(gDto.getFullName().trim());
                    guestObj.setIdentityDocument(gDto.getIdentityDocument() != null ? gDto.getIdentityDocument().trim() : null);
                    guestObj.setRelationship(gDto.getRelationship() != null ? gDto.getRelationship().trim() : "Khách đi cùng");
                    guestObj.setIsChild(gDto.getIsChild() != null ? gDto.getIsChild() : false);
                    accompanyingGuestRepository.save(guestObj);
                }
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
        List<RoomBooking> bookings = roomBookingRepository.findByEmailAndPhoneWithFullDetails(email.trim(),
                phone.trim());
        // Force-initialize lazy associations within the transaction
        // (cannot JOIN FETCH both 'details' and 'retreatPackages' —
        // MultipleBagFetchException)
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
     * Verifies email+phone ownership, checks room overlap, validates activity
     * ranges,
     * and recalculates the invoice automatically.
     */
    @Transactional
    public RoomBooking updateBooking(Integer bookingId, String email, String phone, BookingRequestDTO dto) {
        // 1. Verify ownership via email + phone
        RoomBooking booking = roomBookingRepository.findByIdWithFullDetails(bookingId)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y Ä‘áº·t phÃ²ng vá»›i ID: " + bookingId));

        User user = booking.getUser();
        if (user == null || !email.equalsIgnoreCase(user.getEmail()) || !phone.equals(user.getPhone())) {
            throw new RuntimeException(
                    "ThÃ´ng tin Email hoáº·c Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng khá»›p vá»›i Ä‘Æ¡n Ä‘áº·t phÃ²ng nÃ y.");
        }

        // 2. Update guest name/phone if provided
        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone());
        }
        userRepository.save(user);

        if (dto.getSpecialRequests() != null) {
            booking.setSpecialRequests(dto.getSpecialRequests());
        }

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
                        if (spa.getStartDatetime().isBefore(newCheckIn)
                                || spa.getStartDatetime().isAfter(newCheckOut)) {
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
                        throw new RuntimeException(
                                "KhÃ´ng thá»ƒ thay Ä‘á»•i ngÃ y: CÃ³ Ä‘Æ¡n gá»i mÃ³n náº±m ngoÃ i khoáº£ng thá»i gian lÆ°u trÃº má»›i.");
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

    @Transactional
    public RoomBooking cancelBooking(Integer bookingId, String reason) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new fu.se.smms.exception.BusinessException("BOOKING-001",
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy thông tin đặt phòng."));

        if (!"PENDING_DEPOSIT".equalsIgnoreCase(booking.getStatus())
                && !"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new fu.se.smms.exception.BusinessException("BOOKING-002",
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Không thể hủy đặt phòng ở trạng thái hiện tại: " + booking.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        BigDecimal refundAmt = BigDecimal.ZERO;

        if ("CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            LocalDateTime checkIn = booking.getCheckInDate();
            long diffHours = java.time.Duration.between(now, checkIn).toHours();
            BigDecimal deposit = booking.getTotalDeposit() != null ? booking.getTotalDeposit() : BigDecimal.ZERO;

            if (diffHours >= 24) {
                refundAmt = deposit; // 100%
            } else if (diffHours >= 12) {
                refundAmt = deposit.multiply(new BigDecimal("0.50")).setScale(2, java.math.RoundingMode.HALF_UP); // 50%
            } else {
                refundAmt = BigDecimal.ZERO; // 0%
            }
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(reason);
        booking.setCancellationTime(now);
        booking.setRefundAmount(refundAmt);

        RoomBooking saved = roomBookingRepository.save(booking);

        // Khôi phục trạng thái phòng từ VIEWING về AVAILABLE
        try {
            if (booking.getDetails() != null) {
                for (RoomBookingDetail detail : booking.getDetails()) {
                    Room room = detail.getRoom();
                    if (room != null && "VIEWING".equalsIgnoreCase(room.getStatus())) {
                        room.setStatus("AVAILABLE");
                        roomRepository.save(room);
                    }
                }
            }
        } catch (Exception e) {
            // Non-fatal
        }

        // Update the invoice to CANCELLED as the whole booking is cancelled
        try {
            List<Invoice> invoices = invoiceRepository.findByRoomBooking_BookingId(bookingId);
            for (Invoice invoice : invoices) {
                invoice.setStatus("CANCELLED");
                invoiceRepository.save(invoice);
            }
        } catch (Exception e) {
            // Non-fatal
        }

        // Cancel all pending / preparing food orders
        try {
            List<FoodOrder> pendingOrders = foodOrderRepository.findByRoomBooking_BookingId(bookingId)
                    .stream()
                    .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())
                            || "PREPARING".equalsIgnoreCase(o.getStatus()))
                    .collect(Collectors.toList());
            for (FoodOrder order : pendingOrders) {
                order.setStatus("CANCELLED");
            }
            if (!pendingOrders.isEmpty()) {
                foodOrderRepository.saveAll(pendingOrders);
            }
        } catch (Exception e) {
            // Non-fatal
        }

        // Cancel all associated spa bookings
        try {
            List<SpaBooking> spaBookings = spaBookingRepository.findByRoomBookingId(bookingId);
            for (SpaBooking sb : spaBookings) {
                if ("PENDING".equalsIgnoreCase(sb.getStatus()) || "CONFIRMED".equalsIgnoreCase(sb.getStatus())) {
                    sb.setStatus("CANCELLED");
                    sb.setCancellationReason(
                            reason != null && !reason.isBlank() ? reason : "Hủy do hủy phòng đặt cùng.");
                    sb.setCancellationTime(now);
                    sb.setRefundAmount(BigDecimal.ZERO);
                    if (sb.getTreatmentRoom() != null) {
                        sb.getTreatmentRoom().setStatus("AVAILABLE");
                        treatmentRoomRepository.save(sb.getTreatmentRoom());
                    }
                    spaBookingRepository.save(sb);
                }
            }
        } catch (Exception e) {
            // Non-fatal
        }

        return saved;
    }

    @Transactional
    public RoomBooking cancelRoomBookingDetail(Integer detailId, String reason) {
        RoomBookingDetail detail = roomBookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new fu.se.smms.exception.BusinessException("BOOKING-001",
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đặt phòng."));

        RoomBooking booking = detail.getRoomBooking();
        if (booking == null) {
            throw new fu.se.smms.exception.BusinessException("BOOKING-002",
                    org.springframework.http.HttpStatus.CONFLICT, "Chi tiết phòng này không thuộc về đặt phòng nào.");
        }

        if (!"PENDING_DEPOSIT".equalsIgnoreCase(booking.getStatus())
                && !"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new fu.se.smms.exception.BusinessException("BOOKING-002",
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Không thể hủy phòng ở trạng thái hiện tại: " + booking.getStatus());
        }

        // If this is the last room, cancel the entire booking
        if (booking.getDetails() == null || booking.getDetails().size() <= 1) {
            return cancelBooking(booking.getBookingId(), reason);
        }

        LocalDateTime now = LocalDateTime.now();
        BigDecimal refundAmt = BigDecimal.ZERO;
        BigDecimal roomPrice = detail.getPriceAtBooking() != null ? detail.getPriceAtBooking() : BigDecimal.ZERO;
        long nights = java.time.Duration.between(booking.getCheckInDate(), booking.getCheckOutDate()).toDays();
        if (nights <= 0)
            nights = 1;
        BigDecimal roomTotalAmount = roomPrice.multiply(BigDecimal.valueOf(nights));

        // Get deposit ratio from config, default to 30%
        BigDecimal depositRatio = systemConfigurationRepository.findByConfigKey("deposit_ratio")
                .map(c -> {
                    try {
                        return new BigDecimal(c.getConfigValue());
                    } catch (Exception e) {
                        return new BigDecimal("0.30");
                    }
                })
                .orElse(new BigDecimal("0.30"));

        // deposit for this room = roomTotalAmount * 1.10 (tax) * depositRatio
        BigDecimal roomDeposit = roomTotalAmount.multiply(new BigDecimal("1.10")).multiply(depositRatio).setScale(2,
                java.math.RoundingMode.HALF_UP);

        if ("CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            LocalDateTime checkIn = booking.getCheckInDate();
            long diffHours = java.time.Duration.between(now, checkIn).toHours();

            if (diffHours >= 24) {
                refundAmt = roomDeposit; // 100% of this room's deposit
            } else if (diffHours >= 12) {
                refundAmt = roomDeposit.multiply(new BigDecimal("0.50")).setScale(2, java.math.RoundingMode.HALF_UP); // 50%
            } else {
                refundAmt = BigDecimal.ZERO; // 0%
            }
        }

        // Update room status to AVAILABLE
        Room room = detail.getRoom();
        if (room != null) {
            room.setStatus("AVAILABLE");
            roomRepository.save(room);
        }

        // Remove the detail from the booking's list and delete it
        booking.getDetails().remove(detail);
        roomBookingDetailRepository.delete(detail);

        // Update booking fields
        BigDecimal currentDeposit = booking.getTotalDeposit() != null ? booking.getTotalDeposit() : BigDecimal.ZERO;
        BigDecimal newDeposit = currentDeposit.subtract(roomDeposit);
        if (newDeposit.compareTo(BigDecimal.ZERO) < 0) {
            newDeposit = BigDecimal.ZERO;
        }
        booking.setTotalDeposit(newDeposit);

        BigDecimal currentRefund = booking.getRefundAmount() == null ? BigDecimal.ZERO : booking.getRefundAmount();
        booking.setRefundAmount(currentRefund.add(refundAmt));

        String roomNum = room != null ? room.getRoomNumber() : "N/A";
        String roomCancelInfo = String.format("Hủy phòng %s (Hoàn trả: %s, Lý do: %s)", roomNum, refundAmt.toString(),
                reason);
        booking.setCancellationReason(
                booking.getCancellationReason() == null || booking.getCancellationReason().isBlank()
                        ? roomCancelInfo
                        : booking.getCancellationReason() + "; " + roomCancelInfo);
        booking.setCancellationTime(now);

        RoomBooking saved = roomBookingRepository.save(booking);

        // Recalculate invoice
        try {
            invoiceService.createInvoice(booking.getBookingId());
        } catch (Exception ignored) {
        }

        return saved;
    }
}

