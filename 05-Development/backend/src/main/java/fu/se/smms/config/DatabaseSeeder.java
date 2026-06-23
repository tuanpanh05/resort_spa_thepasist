package fu.se.smms.config;

import fu.se.smms.entity.User;
import fu.se.smms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("[DB Seeder] Automatically executing patch_utf8.sql to ensure correct Vietnamese encoding on all screens...");
            org.springframework.jdbc.datasource.init.ResourceDatabasePopulator populator = 
                new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(
                    new org.springframework.core.io.ClassPathResource("patch_utf8.sql")
                );
            populator.setSqlScriptEncoding("UTF-8");
            populator.execute(jdbcTemplate.getDataSource());
            System.out.println("[DB Seeder] Successfully applied Unicode encoding patches from patch_utf8.sql.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not run patch_utf8.sql: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Creating booking_packages table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.booking_packages', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.booking_packages (
                        booking_id INT NOT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE,
                        package_id INT NOT NULL REFERENCES dbo.retreat_packages(package_id) ON DELETE CASCADE,
                        PRIMARY KEY (booking_id, package_id)
                    );
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not create booking_packages table: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Creating complaints table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.complaints', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.complaints (
                        id          INT           IDENTITY(1,1) PRIMARY KEY,
                        user_id     INT           NULL REFERENCES dbo.users(user_id) ON DELETE SET NULL,
                        guest_name  NVARCHAR(255) NOT NULL,
                        room_number VARCHAR(50)   NOT NULL,
                        content     NVARCHAR(MAX) NOT NULL,
                        status      VARCHAR(20)   NOT NULL DEFAULT 'Open',
                        created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
                        feedback    NVARCHAR(MAX) NULL
                    );
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not create complaints table: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Altering columns to NVARCHAR and adding available_days...");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE retreat_packages ALTER COLUMN name NVARCHAR(200) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE spa_services ALTER COLUMN name NVARCHAR(150) NOT NULL");
            
            // Fix encoding for food_menu
            jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN dish_name NVARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN description NVARCHAR(MAX) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN category NVARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN allergens NVARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN ingredients NVARCHAR(MAX)");
            System.out.println("[DB Seeder] Successfully upgraded database columns to NVARCHAR.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not alter database columns. Reason: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Adding new columns (image_url, is_package_included, periods, available_days)...");
            jdbcTemplate.execute("ALTER TABLE food_menu ADD available_days VARCHAR(50) DEFAULT '0,1,2,3,4,5,6'");
        } catch (Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE food_menu ADD image_url VARCHAR(255)"); } catch (Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE food_menu ADD is_package_included BIT DEFAULT 1"); } catch (Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE food_menu ADD periods VARCHAR(100) DEFAULT 'Lunch'"); } catch (Exception e) {}
        try {
            System.out.println("[DB Seeder] Adding origin column to food_order table...");
            jdbcTemplate.execute("ALTER TABLE dbo.food_order ADD origin VARCHAR(50)");
            System.out.println("[DB Seeder] Successfully added origin column.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not add origin column: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Skipping hardcoded Food Menu updates to preserve user edits.");
            /* 
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Cháo Yến Mạch Hạt Chia', description=N'Cháo yến mạch nguyên cám nấu cùng hạt chia, hạt óc chó và dâu tây tươi.', dietary_tags='Vegan, Healthy', price=120000, available_days='1,3,5', image_url='/images/dishes/dish_chao_yen_mach.png', is_package_included=1, periods='Breakfast' WHERE food_id=1");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Bún Gạo Lứt Chay', description=N'Bún nưa ăn kèm đậu hũ non, nấm đùi gà và nước dùng ngọt thanh từ củ quả.', dietary_tags='Vegan, Healthy', price=150000, available_days='0,2,4,6', image_url='/images/dishes/dish_bun_gao_lut.png', is_package_included=1, periods='Breakfast' WHERE food_id=2");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Bánh Mì Nguyên Cám Trứng Chần', description=N'Bánh mì đen nguyên cám nướng giòn kèm bơ sáp và trứng chần.', dietary_tags='Healthy, Vegetarian', price=140000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_banh_mi_trung.png', is_package_included=1, periods='Breakfast' WHERE food_id=3");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Phở Gạo Lứt Bò Thảo Mộc', description=N'Phở nấu từ gạo lứt nảy mầm, nước dùng hầm xương bò thảo mộc trong 12h.', dietary_tags='Healthy, Meat', price=250000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_pho_bo.png', is_package_included=0, periods='Breakfast' WHERE food_id=4");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Nước Ép Green Detox', description=N'Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.', dietary_tags='Vegan, Detox', price=95000, available_days='0,2,4,6', image_url='/images/dishes/dish_green_detox.png', is_package_included=1, periods='Breakfast,Lunch' WHERE food_id=5");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Trà Thảo Mộc Hoa Cúc', description=N'Trà hoa cúc ủ lạnh thanh nhiệt, giúp an thần và dễ tiêu hóa.', dietary_tags='Vegan, Detox', price=85000, available_days='1,3,5', image_url='/images/dishes/dish_tra_hoa_cuc.png', is_package_included=1, periods='Breakfast,Lunch' WHERE food_id=6");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Organic Avocado Quinoa Salad', description=N'Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.', dietary_tags='Vegan, Gluten-Free', price=180000, available_days='1,3,5', image_url='/images/dishes/dish_quinoa_salad.png', is_package_included=1, periods='Lunch' WHERE food_id=7");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Mì Soba Lạnh Nhật Bản', description=N'Mì kiều mạch Nhật Bản thanh mát, ăn kèm rong biển và nước tương dashi nấm.', dietary_tags='Vegan, Healthy', price=210000, available_days='0,2,4,6', image_url='/images/dishes/dish_mi_soba.png', is_package_included=1, periods='Lunch' WHERE food_id=8");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Cơm Gạo Lứt Ngũ Sắc', description=N'Cơm gạo lứt dẻo nấu cùng đậu gà, bắp, đậu hà lan và hạt sen.', dietary_tags='Vegan, Healthy', price=160000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_com_gao_lut.png', is_package_included=1, periods='Lunch,Dinner' WHERE food_id=9");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Cá Hồi Áp Chảo Măng Tây', description=N'Cá hồi Na Uy áp chảo sốt bơ chanh ăn kèm măng tây nướng.', dietary_tags='Seafood, Keto', price=450000, available_days='1,3,5', image_url='/images/dishes/dish_ca_hoi.png', is_package_included=1, periods='Dinner' WHERE food_id=10");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Ginseng Chicken Soup', description=N'Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.', dietary_tags='Keto, Healthy', price=320000, available_days='0,2,4,6', image_url='/images/dishes/dish_chicken_soup.png', is_package_included=1, periods='Dinner' WHERE food_id=11");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Súp Bí Đỏ Hạnh Nhân', description=N'Súp bí đỏ sánh mịn nấu cùng sữa hạnh nhân hữu cơ và dầu olive.', dietary_tags='Vegan, Gluten-Free', price=150000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_sup_bi_do.png', is_package_included=1, periods='Dinner' WHERE food_id=12");
            
            // For 13 and 14, try to insert if they don't exist. We use a simple count check.
            Integer count13 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE food_id=13", Integer.class);
            if (count13 != null && count13 == 0) {
                jdbcTemplate.update("INSERT INTO food_menu (dish_name, description, dietary_tags, price, periods, is_today_menu, available_days, image_url, is_package_included) VALUES (N'Steak Bò Wagyu', N'Thăn nội bò Wagyu nướng than hoa mềm tan, ăn kèm rau củ nướng.', 'Meat, Keto', 1250000, 'Dinner', 1, '0,1,2,3,4,5,6', '/images/dishes/dish_steak_wagyu.png', 0)");
            }
            
            Integer count14 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE food_id=14", Integer.class);
            if (count14 != null && count14 == 0) {
                jdbcTemplate.update("INSERT INTO food_menu (dish_name, description, dietary_tags, price, periods, is_today_menu, available_days, image_url, is_package_included) VALUES (N'Tôm Sú Rim Tỏi Ớt', N'Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.', 'Seafood, Spicy', 390000, 'Lunch,Dinner', 1, '0,1,2,3,4,5,6', '/images/dishes/dish_tom_su.png', 0)");
            }
            */
            System.out.println("[DB Seeder] Food Menu items preserved successfully.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Could not check Food Menu. Reason: " + e.getMessage());
        }

        seedUser("admin@nguson.com", "Administrator", "0900000000", "ADMIN");
        seedUser("staff@nguson.com", "Staff Member", "0900000001", "STAFF");
        seedUser("chef@nguson.com", "Chef Specialist", "0900000002", "CHEF");
        seedUser("therapist@nguson.com", "Therapist Specialist", "0900000003", "THERAPIST");
        seedUser("spa@nguson.com", "Spa Specialist", "0900000004", "THERAPIST");
        seedUser("yoga@nguson.com", "Yoga Trainer", "0900000005", "THERAPIST");
        seedUser("physio@nguson.com", "Physiotherapist", "0900000006", "THERAPIST");

        try {
            // Check if database is already seeded to avoid losing user data
            Integer existingRooms = 0;
            try {
                existingRooms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM room", Integer.class);
            } catch (Exception e) {
                // Table might not exist yet
            }

            if (existingRooms != null && existingRooms == 45) {
                System.out.println("[DB Seeder] Database is already seeded (found " + existingRooms + " rooms). Skipping database wipe to preserve your data.");
                try {
                    jdbcTemplate.update("UPDATE dbo.room_booking SET check_in_date = CAST(GETDATE() AS DATE), check_out_date = DATEADD(day, 5, CAST(GETDATE() AS DATE)) WHERE booking_id = (SELECT MIN(booking_id) FROM dbo.room_booking)");
                    System.out.println("[DB Seeder] Force updated first room booking to check in today.");
                } catch (Exception e) {
                    System.err.println("[DB Seeder] Warning: could not force update booking: " + e.getMessage());
                }
                return;
            }

            System.out.println("[DB Seeder] Re-aligning Room Type Prices, cleaning and setting up exactly 45 Rooms...");

            // 2. Clean child tables of Room/Booking to prevent constraint errors
            try { jdbcTemplate.update("DELETE FROM room_guest_declaration"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM room_booking_detail"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM payment_transaction_log"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM invoice"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM spa_booking"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM food_order_detail"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM food_order"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM feedback"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM complaints"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM booking_packages"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM room_booking"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM room"); } catch (Exception e) {}
            try { jdbcTemplate.update("DELETE FROM room_types"); } catch (Exception e) {}

            // Seed new room types
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Bungalow Gỗ Hướng Suối', 3200000.00, 2, 65)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Bungalow Đá Cuội Bên Rừng', 3800000.00, 2, 75)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Biệt Thự Đồi Trà Thiền Định', 5800000.00, 4, 120)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Biệt Thự Gia Đình Sen Trắng', 7500000.00, 8, 180)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Nhà Sàn Cộng Đồng Đông Sơn', 9000000.00, 25, 250)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Nhà Chung 50 Thung Lũng Xanh', 12500000.00, 50, 450)");

            // Get Room Type IDs to ensure we insert with correct IDs
            Integer woodBungId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Bungalow Gỗ Hướng Suối'", Integer.class);
            Integer pebbleBungId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Bungalow Đá Cuội Bên Rừng'", Integer.class);
            Integer teaVillaId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Biệt Thự Đồi Trà Thiền Định'", Integer.class);
            Integer lotusVillaId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Biệt Thự Gia Đình Sen Trắng'", Integer.class);
            Integer donSanId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Nhà Sàn Cộng Đồng Đông Sơn'", Integer.class);
            Integer valley50Id = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Nhà Chung 50 Thung Lũng Xanh'", Integer.class);

            if (woodBungId != null && pebbleBungId != null && teaVillaId != null && lotusVillaId != null && donSanId != null) {
                // 10 Bungalow Gỗ Hướng Suối (BG-101 to BG-110)
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", woodBungId, String.format("BG-%03d", 100 + i));
                }

                // 10 Bungalow Đá Cuội Bên Rừng (BD-101 to BD-110)
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", pebbleBungId, String.format("BD-%03d", 100 + i));
                }

                // 10 Biệt Thự Đồi Trà Thiền Định (BT-101 to BT-110)
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", teaVillaId, String.format("BT-%03d", 100 + i));
                }

                // 5 Biệt Thự Gia Đình Sen Trắng (BS-101 to BS-105)
                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", lotusVillaId, String.format("BS-%03d", 100 + i));
                }

                // 5 Nhà Sàn Cộng Đồng Đông Sơn (NS-101 to NS-105)
                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", donSanId, String.format("NS-%03d", 100 + i));
                }

                // 5 Nhà Chung 50 Thung Lũng Xanh (NC-101 to NC-105)
                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", valley50Id, String.format("NC-%03d", 100 + i));
                }

                // Re-seed default bookings so the staff page isn't empty
                jdbcTemplate.update("INSERT INTO room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES (5, 1, GETDATE(), DATEADD(day, 5, GETDATE()), 'CONFIRMED', 3750000.00)");
                jdbcTemplate.update("INSERT INTO room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES (6, NULL, DATEADD(day, 2, GETDATE()), DATEADD(day, 4, GETDATE()), 'CONFIRMED', 2700000.00)");

                // Re-seed default booking details
                Integer booking1 = jdbcTemplate.queryForObject("SELECT TOP 1 booking_id FROM room_booking ORDER BY booking_id ASC", Integer.class);
                Integer booking2 = jdbcTemplate.queryForObject("SELECT TOP 1 booking_id FROM room_booking ORDER BY booking_id DESC", Integer.class);
                Integer room1Id = jdbcTemplate.queryForObject("SELECT room_id FROM room WHERE room_number = 'BG-101'", Integer.class);
                Integer room2Id = jdbcTemplate.queryForObject("SELECT room_id FROM room WHERE room_number = 'BG-102'", Integer.class);

                if (booking1 != null && room1Id != null) {
                    jdbcTemplate.update("INSERT INTO room_booking_detail (booking_id, room_id, price_at_booking) VALUES (?, ?, 3200000.00)", booking1, room1Id);
                    jdbcTemplate.update("INSERT INTO invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status) VALUES (5, ?, 16000000.00, 0.00, 0.00, 1600000.00, 17600000.00, 3750000.00, 13850000.00, 'UNPAID')", booking1);
                }
                if (booking2 != null && room2Id != null && !booking2.equals(booking1)) {
                    jdbcTemplate.update("INSERT INTO room_booking_detail (booking_id, room_id, price_at_booking) VALUES (?, ?, 3200000.00)", booking2, room2Id);
                    jdbcTemplate.update("INSERT INTO invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status) VALUES (6, ?, 6400000.00, 0.00, 0.00, 640000.00, 7040000.00, 2700000.00, 4340000.00, 'UNPAID')", booking2);
                }

                // Seed default complaints
                try {
                    jdbcTemplate.update("INSERT INTO complaints (user_id, guest_name, room_number, content, status, created_at, feedback) VALUES (?, ?, ?, ?, ?, DATEADD(hour, -3, GETDATE()), ?)",
                            5, "Trần Khách Hàng", "BG-101", "Gối hơi cao, cần đổi 2 gối lông vũ mềm hơn.", "Resolved", "Đã giao gối mới lúc 15:00");
                    jdbcTemplate.update("INSERT INTO complaints (user_id, guest_name, room_number, content, status, created_at, feedback) VALUES (?, ?, ?, ?, ?, DATEADD(hour, -1, GETDATE()), NULL)",
                            6, "Lê Minh Châu", "BG-102", "Wifi trong góc phòng hơi yếu, thỉnh thoảng mất kết nối.", "Open");
                    System.out.println("[DB Seeder] Seeded default complaints successfully.");
                } catch (Exception e) {
                    System.err.println("[DB Seeder] Warning: Complaints seeding failed: " + e.getMessage());
                }
            }
            
            try {
                System.out.println("[DB Seeder] Running data correction patch for overlapping room bookings...");
                jdbcTemplate.execute("""
                    -- Fix room assignment for Invoice 44 (assign BG-102, BG-103)
                    DECLARE @booking44 INT;
                    SELECT @booking44 = room_booking_id FROM invoice WHERE invoice_id = 44;
    
                    DECLARE @room2Id INT, @room3Id INT;
                    SELECT @room2Id = room_id FROM room WHERE room_number = 'BG-102';
                    SELECT @room3Id = room_id FROM room WHERE room_number = 'BG-103';
    
                    IF @booking44 IS NOT NULL AND @room2Id IS NOT NULL AND @room3Id IS NOT NULL
                    BEGIN
                        -- Update detail that was BG-101 to BG-102
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room2Id
                        WHERE booking_id = @booking44 AND room_id = (SELECT room_id FROM room WHERE room_number = 'BG-101');
    
                        -- Update detail that was BG-102 to BG-103
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room3Id
                        WHERE booking_id = @booking44 AND room_id = (SELECT room_id FROM room WHERE room_number = 'BG-102');
                    END
    
                    -- Fix room assignment for Invoice 45 (assign BG-104, BG-105)
                    DECLARE @booking45 INT;
                    SELECT @booking45 = room_booking_id FROM invoice WHERE invoice_id = 45;
    
                    DECLARE @room4Id INT, @room5Id INT;
                    SELECT @room4Id = room_id FROM room WHERE room_number = 'BG-104';
                    SELECT @room5Id = room_id FROM room WHERE room_number = 'BG-105';
    
                    IF @booking45 IS NOT NULL AND @room4Id IS NOT NULL AND @room5Id IS NOT NULL
                    BEGIN
                        -- Update detail that was BG-101 to BG-104
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room4Id
                        WHERE booking_id = @booking45 AND room_id = (SELECT room_id FROM room WHERE room_number = 'BG-101');
    
                        -- Update detail that was BG-102 to BG-105
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room5Id
                        WHERE booking_id = @booking45 AND room_id = (SELECT room_id FROM room WHERE room_number = 'BG-102');
                    END
                    """);
                System.out.println("[DB Seeder] Overlapping room bookings corrected successfully.");
            } catch (Exception e) {
                System.err.println("[DB Seeder] Warning: Could not run overlapping room booking patch: " + e.getMessage());
            }

            System.out.println("[DB Seeder] Exactly 45 rooms configured successfully.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Room types / rooms seeding failed: " + e.getMessage());
        }
    }

    private void seedUser(String email, String fullName, String phone, String role) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .status("ACTIVE")
                    .build();
            userRepository.save(user);
            System.out.println("[DB Seeder] Seeded user: " + email + " with role: " + role);
        } else {
            user.setPasswordHash(passwordEncoder.encode("123456"));
            user.setStatus("ACTIVE");
            user.setRole(role);
            userRepository.save(user);
            System.out.println("[DB Seeder] Force updated user credentials, role and status: " + email);
        }
    }
}
