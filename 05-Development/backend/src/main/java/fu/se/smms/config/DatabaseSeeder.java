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
            System.out.println("[DB Seeder] Creating restaurant_table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.restaurant_table', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.restaurant_table (
                        table_id INT IDENTITY(1,1) PRIMARY KEY,
                        table_number VARCHAR(20) NOT NULL UNIQUE,
                        capacity INT NOT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
                    );
                END
                """);

            Integer existingTables = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.restaurant_table", Integer.class);
            if (existingTables != null && existingTables == 0) {
                System.out.println("[DB Seeder] Seeding default restaurant tables...");
                jdbcTemplate.execute("""
                    INSERT INTO dbo.restaurant_table (table_number, capacity, status) VALUES 
                    ('T-01', 2, 'AVAILABLE'),
                    ('T-02', 2, 'AVAILABLE'),
                    ('T-03', 2, 'AVAILABLE'),
                    ('T-04', 2, 'AVAILABLE'),
                    ('T-05', 2, 'AVAILABLE'),
                    ('T-06', 4, 'AVAILABLE'),
                    ('T-07', 4, 'AVAILABLE'),
                    ('T-08', 4, 'AVAILABLE'),
                    ('T-09', 4, 'AVAILABLE'),
                    ('T-10', 4, 'AVAILABLE'),
                    ('T-11', 6, 'AVAILABLE'),
                    ('T-12', 6, 'AVAILABLE'),
                    ('T-13', 6, 'AVAILABLE'),
                    ('T-14', 8, 'AVAILABLE'),
                    ('T-15', 8, 'AVAILABLE')
                    """);
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not create/seed restaurant_table: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Ensuring table_id column in food_order table...");
            jdbcTemplate.execute("""
                IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.food_order') AND name = 'table_id')
                BEGIN
                    ALTER TABLE dbo.food_order ADD table_id INT NULL FOREIGN KEY REFERENCES dbo.restaurant_table(table_id);
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not add table_id to food_order: " + e.getMessage());
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
            System.out.println("[DB Seeder] Adding calendar configuration columns to users table...");
            try { jdbcTemplate.execute("ALTER TABLE users ADD google_calendar_sync_enabled BIT DEFAULT 0"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE users ADD google_calendar_id VARCHAR(255) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE users ADD calendar_reminders_enabled BIT DEFAULT 1"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE users ADD reminder_lead_time_mins INT DEFAULT 30"); } catch (Exception e) {}
            try { jdbcTemplate.execute("UPDATE users SET google_calendar_sync_enabled = 0 WHERE google_calendar_sync_enabled IS NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("UPDATE users SET calendar_reminders_enabled = 1 WHERE calendar_reminders_enabled IS NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("UPDATE users SET reminder_lead_time_mins = 30 WHERE reminder_lead_time_mins IS NULL"); } catch (Exception e) {}
            System.out.println("[DB Seeder] Successfully added/verified calendar columns in users table.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not add calendar columns to users: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Adding cancellation columns to bookings tables...");
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD cancellation_reason NVARCHAR(MAX) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD cancellation_time DATETIME2 NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD refund_amount DECIMAL(12, 2) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD special_requests NVARCHAR(MAX) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD guests_count INT NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD children_under_5 INT NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD children_5_to_12 INT NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE room_booking ADD children_count INT NULL"); } catch (Exception e) {}

            try { jdbcTemplate.execute("ALTER TABLE food_order ADD cancellation_reason NVARCHAR(MAX) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE food_order ADD cancellation_time DATETIME2 NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE food_order ADD refund_amount DECIMAL(12, 2) NULL"); } catch (Exception e) {}

            try { jdbcTemplate.execute("ALTER TABLE spa_booking ADD cancellation_reason NVARCHAR(MAX) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE spa_booking ADD cancellation_time DATETIME2 NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE spa_booking ADD refund_amount DECIMAL(12, 2) NULL"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE spa_booking ADD google_calendar_event_id VARCHAR(255) NULL"); } catch (Exception e) {}
            System.out.println("[DB Seeder] Successfully added/verified cancellation and calendar columns.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not add cancellation or calendar columns: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Skipping hardcoded Food Menu updates to preserve user edits.");
            /* 
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'ChÃ¡o Yáº¿n Máº¡ch Háº¡t Chia', description=N'ChÃ¡o yáº¿n máº¡ch nguyÃªn cÃ¡m náº¥u cÃ¹ng háº¡t chia, háº¡t Ã³c chÃ³ vÃ  dÃ¢u tÃ¢y tÆ°Æ¡i.', dietary_tags='Vegan, Healthy', price=120000, available_days='1,3,5', image_url='/images/dishes/dish_chao_yen_mach.png', is_package_included=1, periods='Breakfast' WHERE food_id=1");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'BÃºn Gáº¡o Lá»©t Chay', description=N'BÃºn nÆ°a Äƒn kÃ¨m Ä‘áº­u hÅ© non, náº¥m Ä‘Ã¹i gÃ  vÃ  nÆ°á»›c dÃ¹ng ngá»t thanh tá»« cá»§ quáº£.', dietary_tags='Vegan, Healthy', price=150000, available_days='0,2,4,6', image_url='/images/dishes/dish_bun_gao_lut.png', is_package_included=1, periods='Breakfast' WHERE food_id=2");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'BÃ¡nh MÃ¬ NguyÃªn CÃ¡m Trá»©ng Cháº§n', description=N'BÃ¡nh mÃ¬ Ä‘en nguyÃªn cÃ¡m nÆ°á»›ng giÃ²n kÃ¨m bÆ¡ sÃ¡p vÃ  trá»©ng cháº§n.', dietary_tags='Healthy, Vegetarian', price=140000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_banh_mi_trung.png', is_package_included=1, periods='Breakfast' WHERE food_id=3");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Phá»Ÿ Gáº¡o Lá»©t BÃ² Tháº£o Má»™c', description=N'Phá»Ÿ náº¥u tá»« gáº¡o lá»©t náº£y máº§m, nÆ°á»›c dÃ¹ng háº§m xÆ°Æ¡ng bÃ² tháº£o má»™c trong 12h.', dietary_tags='Healthy, Meat', price=250000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_pho_bo.png', is_package_included=0, periods='Breakfast' WHERE food_id=4");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'NÆ°á»›c Ã‰p Green Detox', description=N'NÆ°á»›c Ã©p giáº£i Ä‘á»™c gan tá»« cáº§n tÃ¢y há»¯u cÆ¡, tÃ¡o xanh, cáº£i xoÄƒn vÃ  gá»«ng.', dietary_tags='Vegan, Detox', price=95000, available_days='0,2,4,6', image_url='/images/dishes/dish_green_detox.png', is_package_included=1, periods='Breakfast,Lunch' WHERE food_id=5");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'TrÃ  Tháº£o Má»™c Hoa CÃºc', description=N'TrÃ  hoa cÃºc á»§ láº¡nh thanh nhiá»‡t, giÃºp an tháº§n vÃ  dá»… tiÃªu hÃ³a.', dietary_tags='Vegan, Detox', price=85000, available_days='1,3,5', image_url='/images/dishes/dish_tra_hoa_cuc.png', is_package_included=1, periods='Breakfast,Lunch' WHERE food_id=6");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Organic Avocado Quinoa Salad', description=N'Salad diÃªm máº¡ch há»¯u cÆ¡ vá»›i bÆ¡ sÃ¡p cáº¯t lÃ¡t, háº¡t bÃ­ ngÃ´ vÃ  sá»‘t chanh máº­t ong.', dietary_tags='Vegan, Gluten-Free', price=180000, available_days='1,3,5', image_url='/images/dishes/dish_quinoa_salad.png', is_package_included=1, periods='Lunch' WHERE food_id=7");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'MÃ¬ Soba Láº¡nh Nháº­t Báº£n', description=N'MÃ¬ kiá»u máº¡ch Nháº­t Báº£n thanh mÃ¡t, Äƒn kÃ¨m rong biá»ƒn vÃ  nÆ°á»›c tÆ°Æ¡ng dashi náº¥m.', dietary_tags='Vegan, Healthy', price=210000, available_days='0,2,4,6', image_url='/images/dishes/dish_mi_soba.png', is_package_included=1, periods='Lunch' WHERE food_id=8");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'CÆ¡m Gáº¡o Lá»©t NgÅ© Sáº¯c', description=N'CÆ¡m gáº¡o lá»©t dáº»o náº¥u cÃ¹ng Ä‘áº­u gÃ , báº¯p, Ä‘áº­u hÃ  lan vÃ  háº¡t sen.', dietary_tags='Vegan, Healthy', price=160000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_com_gao_lut.png', is_package_included=1, periods='Lunch,Dinner' WHERE food_id=9");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'CÃ¡ Há»“i Ãp Cháº£o MÄƒng TÃ¢y', description=N'CÃ¡ há»“i Na Uy Ã¡p cháº£o sá»‘t bÆ¡ chanh Äƒn kÃ¨m mÄƒng tÃ¢y nÆ°á»›ng.', dietary_tags='Seafood, Keto', price=450000, available_days='1,3,5', image_url='/images/dishes/dish_ca_hoi.png', is_package_included=1, periods='Dinner' WHERE food_id=10");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Ginseng Chicken Soup', description=N'Canh gÃ  háº§m sÃ¢m vÃ  tÃ¡o Ä‘á» bá»• trung Ã­ch khÃ­, há»— trá»£ phá»¥c há»“i sá»©c khá»e.', dietary_tags='Keto, Healthy', price=320000, available_days='0,2,4,6', image_url='/images/dishes/dish_chicken_soup.png', is_package_included=1, periods='Dinner' WHERE food_id=11");
            jdbcTemplate.update("UPDATE food_menu SET dish_name=N'SÃºp BÃ­ Äá» Háº¡nh NhÃ¢n', description=N'SÃºp bÃ­ Ä‘á» sÃ¡nh má»‹n náº¥u cÃ¹ng sá»¯a háº¡nh nhÃ¢n há»¯u cÆ¡ vÃ  dáº§u olive.', dietary_tags='Vegan, Gluten-Free', price=150000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_sup_bi_do.png', is_package_included=1, periods='Dinner' WHERE food_id=12");
            
            // For 13 and 14, try to insert if they don't exist. We use a simple count check.
            Integer count13 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE food_id=13", Integer.class);
            if (count13 != null && count13 == 0) {
                jdbcTemplate.update("INSERT INTO food_menu (dish_name, description, dietary_tags, price, periods, is_today_menu, available_days, image_url, is_package_included) VALUES (N'Steak BÃ² Wagyu', N'ThÄƒn ná»™i bÃ² Wagyu nÆ°á»›ng than hoa má»m tan, Äƒn kÃ¨m rau cá»§ nÆ°á»›ng.', 'Meat, Keto', 1250000, 'Dinner', 1, '0,1,2,3,4,5,6', '/images/dishes/dish_steak_wagyu.png', 0)");
            }
            
            Integer count14 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE food_id=14", Integer.class);
            if (count14 != null && count14 == 0) {
                jdbcTemplate.update("INSERT INTO food_menu (dish_name, description, dietary_tags, price, periods, is_today_menu, available_days, image_url, is_package_included) VALUES (N'TÃ´m SÃº Rim Tá»i á»št', N'TÃ´m sÃº biá»ƒn tÆ°Æ¡i ngon rim tá»i á»›t thÆ¡m lá»«ng cay cay ngá»t ngá»t.', 'Seafood, Spicy', 390000, 'Lunch,Dinner', 1, '0,1,2,3,4,5,6', '/images/dishes/dish_tom_su.png', 0)");
            }
            */
            System.out.println("[DB Seeder] Food Menu items preserved successfully.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Could not check Food Menu. Reason: " + e.getMessage());
        }

        ensureSpecialtySchema();
        seedUser("admin@nguson.com", "Administrator", "0900000000", "ADMIN");
        seedUser("staff@nguson.com", "Staff Member", "0900000001", "STAFF");
        seedUser("chef@nguson.com", "Chef Specialist", "0900000002", "CHEF");
        seedUser("therapist@nguson.com", "KTV Spa Trị Liệu", "0900000003", "THERAPIST", "SPA");
        seedUser("spa@nguson.com", "KTV Spa Himalaya", "0900000004", "THERAPIST", "SPA");
        seedUser("yoga@nguson.com", "HLV Yoga Bờ Biển", "0900000005", "THERAPIST", "YOGA");
        seedUser("physio@nguson.com", "BS Vật Lý Trị Liệu", "0900000006", "THERAPIST", "PHYSIO");

        try {
            // Check if database is already seeded to avoid losing user data
            Integer existingRooms = 0;
            try {
                existingRooms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM room", Integer.class);
            } catch (Exception e) {
                // Table might not exist yet
            }

            if (existingRooms != null && existingRooms > 0) {
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

            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Bungalow Gỗ Hướng Suối', 3200000.00, 2, 65)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Bungalow Đá Cuội Bên Rừng', 3800000.00, 3, 75)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Biệt Thự Đồi Trà Thiền Định', 5800000.00, 4, 120)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Biệt Thự Gia Đình Sen Trắng', 7500000.00, 8, 180)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Nhà Sàn Cộng Đồng Đông Sơn', 9000000.00, 25, 250)");
            jdbcTemplate.update("INSERT INTO room_types (type_name, base_price, capacity, area_sqm) VALUES (N'Nhà Chung 50 Thung Lũng Xanh', 12500000.00, 50, 450)");

            Integer woodBungId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Bungalow Gỗ Hướng Suối'", Integer.class);
            Integer pebbleBungId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Bungalow Đá Cuội Bên Rừng'", Integer.class);
            Integer teaVillaId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Biệt Thự Đồi Trà Thiền Định'", Integer.class);
            Integer lotusVillaId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Biệt Thự Gia Đình Sen Trắng'", Integer.class);
            Integer donSanId = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Nhà Sàn Cộng Đồng Đông Sơn'", Integer.class);
            Integer valley50Id = jdbcTemplate.queryForObject("SELECT room_type_id FROM room_types WHERE type_name = N'Nhà Chung 50 Thung Lũng Xanh'", Integer.class);

            if (woodBungId != null && pebbleBungId != null && teaVillaId != null && lotusVillaId != null && donSanId != null && valley50Id != null) {
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", woodBungId, String.format("BG-%03d", 100 + i));
                }

                // 10 Bungalow ÄÃ¡ Cuá»™i BÃªn Rá»«ng (BD-101 to BD-110)
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", pebbleBungId, String.format("BD-%03d", 100 + i));
                }

                // 10 Biá»‡t Thá»± Äá»“i TrÃ  Thiá»n Äá»‹nh (BT-101 to BT-110)
                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", teaVillaId, String.format("BT-%03d", 100 + i));
                }

                // 5 Biá»‡t Thá»± Gia ÄÃ¬nh Sen Tráº¯ng (BS-101 to BS-105)
                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", lotusVillaId, String.format("BS-%03d", 100 + i));
                }

                // 5 NhÃ  SÃ n Cá»™ng Äá»“ng ÄÃ´ng SÆ¡n (NS-101 to NS-105)
                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", donSanId, String.format("NS-%03d", 100 + i));
                }

                // 5 NhÃ  Chung 50 Thung LÅ©ng Xanh (NC-101 to NC-105)
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
                            5, "Tráº§n KhÃ¡ch HÃ ng", "BG-101", "Gá»‘i hÆ¡i cao, cáº§n Ä‘á»•i 2 gá»‘i lÃ´ng vÅ© má»m hÆ¡n.", "Resolved", "ÄÃ£ giao gá»‘i má»›i lÃºc 15:00");
                    jdbcTemplate.update("INSERT INTO complaints (user_id, guest_name, room_number, content, status, created_at, feedback) VALUES (?, ?, ?, ?, ?, DATEADD(hour, -1, GETDATE()), NULL)",
                            6, "LÃª Minh ChÃ¢u", "BG-102", "Wifi trong gÃ³c phÃ²ng hÆ¡i yáº¿u, thá»‰nh thoáº£ng máº¥t káº¿t ná»‘i.", "Open");
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
        seedUser(email, fullName, phone, role, null);
    }

    private void seedUser(String email, String fullName, String phone, String role, String specialty) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .specialty(specialty)
                    .status("ACTIVE")
                    .build();
            userRepository.save(user);
            System.out.println("[DB Seeder] Seeded: " + email + " role=" + role + " specialty=" + specialty);
        } else {
            user.setPasswordHash(passwordEncoder.encode("123456"));
            user.setStatus("ACTIVE");
            user.setRole(role);
            if (specialty != null) user.setSpecialty(specialty);
            userRepository.save(user);
            System.out.println("[DB Seeder] Updated: " + email + " specialty=" + specialty);
        }
    }

    private void ensureSpecialtySchema() {
        try { jdbcTemplate.execute("ALTER TABLE users ADD specialty VARCHAR(20) NULL"); } catch (Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE treatment_room ADD category VARCHAR(20) NULL"); } catch (Exception e) {}
        try { jdbcTemplate.execute("UPDATE treatment_room SET category='SPA' WHERE room_name IN (N'Therapy Room A',N'Therapy Room B',N'Red Dao Bath Room 1') AND (category IS NULL)"); } catch (Exception e) {}
        Integer cnt = 0;
        try { cnt = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM treatment_room", Integer.class); } catch (Exception e) {}
        if (cnt == null || cnt < 4) {
            try {
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'Phong Tri Lieu Spa A') INSERT INTO treatment_room(room_name,status,category) VALUES(N'Phong Tri Lieu Spa A','AVAILABLE','SPA')");
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'Phong Tri Lieu Spa B') INSERT INTO treatment_room(room_name,status,category) VALUES(N'Phong Tri Lieu Spa B','AVAILABLE','SPA')");
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'Phong Yoga Vom Kinh') INSERT INTO treatment_room(room_name,status,category) VALUES(N'Phong Yoga Vom Kinh','AVAILABLE','YOGA')");
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'San Yoga Bo Bien') INSERT INTO treatment_room(room_name,status,category) VALUES(N'San Yoga Bo Bien','AVAILABLE','YOGA')");
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'Phong VLTL 1') INSERT INTO treatment_room(room_name,status,category) VALUES(N'Phong VLTL 1','AVAILABLE','PHYSIO')");
                jdbcTemplate.execute("IF NOT EXISTS(SELECT 1 FROM treatment_room WHERE room_name=N'Phong VLTL 2') INSERT INTO treatment_room(room_name,status,category) VALUES(N'Phong VLTL 2','AVAILABLE','PHYSIO')");
                System.out.println("[DB Seeder] Seeded 6 treatment rooms across SPA/YOGA/PHYSIO.");
            } catch (Exception e) { System.err.println("[DB Seeder] Room seed warning: " + e.getMessage()); }
        }
    }
}