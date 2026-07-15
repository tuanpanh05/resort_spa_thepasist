package fu.se.smms.config;

import java.math.BigDecimal;
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

    @org.springframework.beans.factory.annotation.Value("${app.db.reset-on-start:false}")
    private boolean resetOnStart;

    @Override
    public void run(String... args) throws Exception {
        java.io.File root = findWorkspaceRoot();
        java.io.File markerFile = new java.io.File(root, "05-Development/backend/.db_reset_completed");

        if (resetOnStart) {
            System.out.println("[DB Seeder] RESET TRIGGERED! Starting database synchronization and reset...");
            try {
                // Wipe the database first to clear all tables and constraints
                wipeDatabase();

                // Consolidate separate SQL files into the Master SQL file
                consolidateSqlFiles(root);

                // 1. Recreate database ResortSpaDB & run the consolidated master schema
                executeSqlScript(root, "03-Design/database/ResortSpaDB_Master.sql");
                
                System.out.println("[DB Seeder] Database reset successfully completed!");
                
                // Upgrade columns to NVARCHAR and add columns before seeding
                try {
                    System.out.println("[DB Seeder] Upgrading database columns to NVARCHAR before seeding...");
                    jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255) NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE retreat_packages ALTER COLUMN name NVARCHAR(200) NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE spa_services ALTER COLUMN name NVARCHAR(150) NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN dish_name NVARCHAR(255) NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN description NVARCHAR(MAX) NOT NULL");
                    jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN category NVARCHAR(255)");
                    jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN allergens NVARCHAR(255)");
                    jdbcTemplate.execute("ALTER TABLE food_menu ALTER COLUMN ingredients NVARCHAR(MAX)");
                    
                    try { jdbcTemplate.execute("ALTER TABLE food_menu ADD available_days VARCHAR(50) DEFAULT '0,1,2,3,4,5,6'"); } catch (Exception e) {}
                    try { jdbcTemplate.execute("ALTER TABLE food_menu ADD image_url VARCHAR(255)"); } catch (Exception e) {}
                    try { jdbcTemplate.execute("ALTER TABLE food_menu ADD is_package_included BIT DEFAULT 1"); } catch (Exception e) {}
                    try { jdbcTemplate.execute("ALTER TABLE food_menu ADD periods VARCHAR(100) DEFAULT 'Lunch'"); } catch (Exception e) {}
                    System.out.println("[DB Seeder] Successfully upgraded database columns to NVARCHAR.");
                } catch (Exception e) {
                    System.err.println("[DB Seeder] Warning during schema upgrade: " + e.getMessage());
                }

                // 2. Copy the dishes images
                syncDishImages(root);
                
                // Restore all missing dishes from the folder
                restoreMissingDishes(root);
                
                // 3. Write marker file
                java.nio.file.Files.writeString(markerFile.toPath(), "completed at " + java.time.LocalDateTime.now());
                
                // 4. Try to disable the flag in application.properties
                disableResetFlagInProperties(root);
                
            } catch (Exception e) {
                System.err.println("[DB Seeder] FATAL ERROR during database reset: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
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

            // Migration: Add columns to complaints if they don't exist
            jdbcTemplate.execute("""
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.complaints') AND name = 'assigned_staff_id')
                BEGIN
                    ALTER TABLE dbo.complaints ADD assigned_staff_id INT NULL REFERENCES dbo.users(user_id);
                END
                """);
            jdbcTemplate.execute("""
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.complaints') AND name = 'assigned_staff_name')
                BEGIN
                    ALTER TABLE dbo.complaints ADD assigned_staff_name NVARCHAR(255) NULL;
                END
                """);
            jdbcTemplate.execute("""
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.complaints') AND name = 'assigned_staff_phone')
                BEGIN
                    ALTER TABLE dbo.complaints ADD assigned_staff_phone VARCHAR(50) NULL;
                END
                """);

            System.out.println("[DB Seeder] Creating complaint_messages table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.complaint_messages', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.complaint_messages (
                        id           INT           IDENTITY(1,1) PRIMARY KEY,
                        complaint_id INT           NOT NULL REFERENCES dbo.complaints(id) ON DELETE CASCADE,
                        sender_id    INT           NULL REFERENCES dbo.users(user_id) ON DELETE SET NULL,
                        sender_name  NVARCHAR(255) NOT NULL,
                        sender_role  VARCHAR(50)   NOT NULL,
                        content      NVARCHAR(MAX) NOT NULL,
                        created_at   DATETIME2     NOT NULL DEFAULT GETDATE()
                    );
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not handle complaints database setup: " + e.getMessage());
        }

        try {
            System.out.println("[DB Seeder] Creating accompanying_guest table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.accompanying_guest', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.accompanying_guest (
                        guest_id INT IDENTITY(1,1) PRIMARY KEY,
                        booking_id INT NOT NULL,
                        full_name NVARCHAR(100) NOT NULL,
                        identity_document VARCHAR(255) NULL,
                        relationship NVARCHAR(50) NULL,
                        is_child BIT NOT NULL DEFAULT 0,
                        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                        CONSTRAINT FK_accompanying_guest_booking FOREIGN KEY (booking_id) REFERENCES dbo.room_booking(booking_id) ON DELETE CASCADE
                    );
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not create accompanying_guest table: " + e.getMessage());
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
            System.out.println("[DB Seeder] Adding maintenance description column to room table...");
            try { jdbcTemplate.execute("ALTER TABLE room ADD maintenance_description NVARCHAR(500) NULL"); } catch (Exception e) {}
            
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
            System.out.println("[DB Seeder] Structural Check: Creating incurred_services table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.incurred_services', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.incurred_services (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        room_booking_id INT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE SET NULL,
                        room_number VARCHAR(50) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        detail NVARCHAR(MAX) NOT NULL,
                        price DECIMAL(12, 2) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
                        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
                    );
                END
                """);

            System.out.println("[DB Seeder] Structural Check: Adding service_subtotal to invoice if not exists...");
            jdbcTemplate.execute("""
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.invoice') AND name = 'service_subtotal')
                BEGIN
                    ALTER TABLE dbo.invoice ADD service_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
                END
                """);
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Structural check for incurred_services failed: " + e.getMessage());
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

        try {
            System.out.println("[DB Seeder] Checking if Kid's Combo exists...");
            Integer countKidsCombo = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM dbo.food_menu WHERE dish_name = N'Combo Trẻ Em Dưới 5 Tuổi'", 
                Integer.class
            );
            if (countKidsCombo != null && countKidsCombo == 0) {
                System.out.println("[DB Seeder] Seeding Combo Trẻ Em Dưới 5 Tuổi...");
                jdbcTemplate.execute("""
                    INSERT INTO dbo.food_menu (dish_name, description, price, dietary_tags, category, is_today_menu, sold_out, is_package_included, periods, available_days, enabled)
                    VALUES (N'Combo Trẻ Em Dưới 5 Tuổi', N'Combo ăn uống đầy đủ dinh dưỡng cho bé dưới 5 tuổi, bao gồm tất cả các loại đồ ăn, không phân biệt sáng, trưa, chiều tối.', 120000.00, 'Omnivore', N'Món trẻ em', 1, 0, 1, 'Breakfast,Lunch,Dinner', '0,1,2,3,4,5,6', 1)
                    """);
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not seed Kid's Combo: " + e.getMessage());
        }

        ensureSpecialtySchema();
        seedUser("admin@nguson.com", "Administrator", "0900000000", "ADMIN");
        seedUser("staff@nguson.com", "Staff Member", "0900000001", "STAFF");
        seedUser("chef@nguson.com", "Chef Specialist", "0900000002", "CHEF");
        seedUser("therapist@nguson.com", "KTV Spa Trị Liệu", "0900000003", "THERAPIST", "SPA");
        seedUser("spa@nguson.com", "KTV Spa Himalaya", "0900000004", "THERAPIST", "SPA");
        seedUser("yoga@nguson.com", "HLV Yoga Bờ Biển", "0900000005", "THERAPIST", "YOGA");
        seedUser("physio@nguson.com", "BS Vật Lý Trị Liệu", "0900000006", "THERAPIST", "PHYSIO");

        // Technical Staff (10 accounts)
        seedUser("staff_tech1@nguson.vn", "Nguyễn Văn Hùng - Kỹ Thuật & Điện Nước", "0912347101", "STAFF", "TECHNICAL");
        seedUser("staff_tech2@nguson.vn", "Trần Anh Tuấn - Kỹ Thuật Điện Lạnh", "0912347102", "STAFF", "TECHNICAL");
        seedUser("staff_tech3@nguson.vn", "Phạm Minh Hoàng - Bảo Trì Thiết Bị", "0912347103", "STAFF", "TECHNICAL");
        seedUser("staff_tech4@nguson.vn", "Lê Hoàng Long - Kỹ Thuật Viên Hạ Tầng", "0912347104", "STAFF", "TECHNICAL");
        seedUser("staff_tech5@nguson.vn", "Nguyễn Tiến Đạt - Kỹ Thuật Hồ Bơi", "0912347105", "STAFF", "TECHNICAL");
        seedUser("staff_tech6@nguson.vn", "Vũ Anh Đức - Bảo Trì Hệ Thống", "0912347106", "STAFF", "TECHNICAL");
        seedUser("staff_tech7@nguson.vn", "Đặng Văn Sơn - Kỹ Thuật Âm Thanh Ánh Sáng", "0912347107", "STAFF", "TECHNICAL");
        seedUser("staff_tech8@nguson.vn", "Hoàng Quốc Việt - Sửa Chữa Đồ Gỗ", "0912347108", "STAFF", "TECHNICAL");
        seedUser("staff_tech9@nguson.vn", "Nguyễn Duy Anh - Kỹ Thuật Mạng & Viễn Thông", "0912347109", "STAFF", "TECHNICAL");
        seedUser("staff_tech10@nguson.vn", "Bùi Thanh Tùng - Kỹ Thuật Tổng Hợp", "0912347110", "STAFF", "TECHNICAL");

        // Cleaning Staff (10 accounts)
        seedUser("staff_clean1@nguson.vn", "Nguyễn Thị Hoa - Buồng Phòng Ca Sáng", "0912347201", "STAFF", "CLEANING");
        seedUser("staff_clean2@nguson.vn", "Lê Thị Mai - Dọn Dẹp Villa", "0912347202", "STAFF", "CLEANING");
        seedUser("staff_clean3@nguson.vn", "Trần Thị Đào - Dọn Dẹp Khu Vực Chung", "0912347203", "STAFF", "CLEANING");
        seedUser("staff_clean4@nguson.vn", "Phạm Thị Cúc - Buồng Phòng Ca Chiều", "0912347204", "STAFF", "CLEANING");
        seedUser("staff_clean5@nguson.vn", "Nguyễn Thị Lan - Giặt Ủi & Vệ Sinh", "0912347205", "STAFF", "CLEANING");
        seedUser("staff_clean6@nguson.vn", "Vũ Thị Hồng - Dọn Dẹp Khu Spa", "0912347206", "STAFF", "CLEANING");
        seedUser("staff_clean7@nguson.vn", "Hoàng Thị Tuyết - Vệ Sinh Ngoại Cảnh", "0912347207", "STAFF", "CLEANING");
        seedUser("staff_clean8@nguson.vn", "Đỗ Thị Thảo - Buồng Phòng Deluxe", "0912347208", "STAFF", "CLEANING");
        seedUser("staff_clean9@nguson.vn", "Bùi Thị Dung - Dọn Dẹp Khu Nhà Hàng", "0912347209", "STAFF", "CLEANING");
        seedUser("staff_clean10@nguson.vn", "Nguyễn Thị Kim - Buồng Phòng Ca Tối", "0912347210", "STAFF", "CLEANING");

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
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", woodBungId, String.format("#S%03d", 100 + i));
                }

                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", pebbleBungId, String.format("#V%03d", 100 + i));
                }

                for (int i = 1; i <= 10; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", teaVillaId, String.format("#P%03d", 100 + i));
                }

                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", lotusVillaId, String.format("#F%03d", 100 + i));
                }

                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", donSanId, String.format("#NS%03d", 100 + i));
                }

                for (int i = 1; i <= 5; i++) {
                    jdbcTemplate.update("INSERT INTO room (room_type_id, room_number, status) VALUES (?, ?, 'AVAILABLE')", valley50Id, String.format("#NC%03d", 100 + i));
                }

                // Re-seed default bookings so the staff page isn't empty
                jdbcTemplate.update("INSERT INTO room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES (5, 1, GETDATE(), DATEADD(day, 5, GETDATE()), 'CONFIRMED', 3750000.00)");
                jdbcTemplate.update("INSERT INTO room_booking (user_id, package_id, check_in_date, check_out_date, status, total_deposit) VALUES (6, NULL, DATEADD(day, 2, GETDATE()), DATEADD(day, 4, GETDATE()), 'CONFIRMED', 2700000.00)");

                // Re-seed default booking details
                Integer booking1 = jdbcTemplate.queryForObject("SELECT TOP 1 booking_id FROM room_booking ORDER BY booking_id ASC", Integer.class);
                Integer booking2 = jdbcTemplate.queryForObject("SELECT TOP 1 booking_id FROM room_booking ORDER BY booking_id DESC", Integer.class);
                Integer room1Id = jdbcTemplate.queryForObject("SELECT room_id FROM room WHERE room_number = '#S101'", Integer.class);
                Integer room2Id = jdbcTemplate.queryForObject("SELECT room_id FROM room WHERE room_number = '#S102'", Integer.class);

                if (booking1 != null && room1Id != null) {
                    jdbcTemplate.update("INSERT INTO room_booking_detail (booking_id, room_id, price_at_booking) VALUES (?, ?, 3200000.00)", booking1, room1Id);
                    jdbcTemplate.update("INSERT INTO invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status) VALUES (5, ?, 16000000.00, 0.00, 0.00, 1600000.00, 17600000.00, 3750000.00, 13850000.00, 'UNPAID')", booking1);
                }

                try {
                    jdbcTemplate.update("INSERT INTO complaints (user_id, guest_name, room_number, content, status, created_at, feedback) VALUES (?, ?, ?, ?, ?, DATEADD(hour, -1, GETDATE()), NULL)",
                            6, "Lê Minh Châu", "#S102", "Wifi trong góc phòng hơi yếu, thỉnh thoảng mất kết nối.", "Open");
                    System.out.println("[DB Seeder] Seeded default complaints successfully.");
                } catch (Exception e) {
                    System.err.println("[DB Seeder] Warning: Complaints seeding failed: " + e.getMessage());
                }
            }
            
            try {
                System.out.println("[DB Seeder] Running data correction patch for overlapping room bookings...");
                jdbcTemplate.execute("""
                    -- Fix room assignment for Invoice 44 (assign #S102, #S103)
                    DECLARE @booking44 INT;
                    SELECT @booking44 = room_booking_id FROM invoice WHERE invoice_id = 44;
    
                    DECLARE @room2Id INT, @room3Id INT;
                    SELECT @room2Id = room_id FROM room WHERE room_number = '#S102';
                    SELECT @room3Id = room_id FROM room WHERE room_number = '#S103';
    
                    IF @booking44 IS NOT NULL AND @room2Id IS NOT NULL AND @room3Id IS NOT NULL
                    BEGIN
                        -- Update detail that was #S101 to #S102
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room2Id
                        WHERE booking_id = @booking44 AND room_id = (SELECT room_id FROM room WHERE room_number = '#S101');
    
                        -- Update detail that was #S102 to #S103
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room3Id
                        WHERE booking_id = @booking44 AND room_id = (SELECT room_id FROM room WHERE room_number = '#S102');
                    END
    
                    -- Fix room assignment for Invoice 45 (assign #S104, #S105)
                    DECLARE @booking45 INT;
                    SELECT @booking45 = room_booking_id FROM invoice WHERE invoice_id = 45;
    
                    DECLARE @room4Id INT, @room5Id INT;
                    SELECT @room4Id = room_id FROM room WHERE room_number = '#S104';
                    SELECT @room5Id = room_id FROM room WHERE room_number = '#S105';
    
                    IF @booking45 IS NOT NULL AND @room4Id IS NOT NULL AND @room5Id IS NOT NULL
                    BEGIN
                        -- Update detail that was #S101 to #S104
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room4Id
                        WHERE booking_id = @booking45 AND room_id = (SELECT room_id FROM room WHERE room_number = '#S101');
    
                        -- Update detail that was #S102 to #S105
                        UPDATE TOP (1) room_booking_detail
                        SET room_id = @room5Id
                        WHERE booking_id = @booking45 AND room_id = (SELECT room_id FROM room WHERE room_number = '#S102');
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
 
        // Incurred Services Setup
        try {
            System.out.println("[DB Seeder] Creating incurred_services table if not exists...");
            jdbcTemplate.execute("""
                IF OBJECT_ID('dbo.incurred_services', 'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.incurred_services (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        room_booking_id INT NULL REFERENCES dbo.room_booking(booking_id) ON DELETE SET NULL,
                        room_number VARCHAR(50) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        detail NVARCHAR(MAX) NOT NULL,
                        price DECIMAL(12, 2) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
                        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
                    );
                END
                """);
 
            System.out.println("[DB Seeder] Adding service_subtotal to invoice if not exists...");
            jdbcTemplate.execute("""
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.invoice') AND name = 'service_subtotal')
                BEGIN
                    ALTER TABLE dbo.invoice ADD service_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
                END
                """);
 
            Integer serviceCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.incurred_services", Integer.class);
            if (serviceCount != null && serviceCount == 0) {
                System.out.println("[DB Seeder] Seeding initial incurred services...");
                
                Integer bookingBG101 = null;
                Integer bookingBG102 = null;
                try {
                    bookingBG101 = jdbcTemplate.queryForObject(
                        "SELECT TOP 1 rb.booking_id FROM dbo.room_booking rb JOIN dbo.room_booking_detail d ON rb.booking_id = d.booking_id JOIN dbo.room r ON d.room_id = r.room_id WHERE r.room_number = '#S101' AND rb.status IN ('CONFIRMED', 'CHECKED_IN') ORDER BY rb.check_in_date DESC",
                        Integer.class
                    );
                } catch (Exception e) {}
 
                try {
                    bookingBG102 = jdbcTemplate.queryForObject(
                        "SELECT TOP 1 rb.booking_id FROM dbo.room_booking rb JOIN dbo.room_booking_detail d ON rb.booking_id = d.booking_id JOIN dbo.room r ON d.room_id = r.room_id WHERE r.room_number = '#S102' AND rb.status IN ('CONFIRMED', 'CHECKED_IN') ORDER BY rb.check_in_date DESC",
                        Integer.class
                    );
                } catch (Exception e) {}
 
                jdbcTemplate.update("INSERT INTO dbo.incurred_services (room_booking_id, room_number, category, detail, price, status) VALUES (?, '#S101', 'Spa booking', N'Massage Đá nóng thảo dược (90 phút)', 1200000.00, 'In Progress')", bookingBG101);
                jdbcTemplate.update("INSERT INTO dbo.incurred_services (room_booking_id, room_number, category, detail, price, status) VALUES (?, '#S102', 'Restaurant order', N'Súp sâm yến mạch thực dưỡng & trà sen', 450000.00, 'Pending')", bookingBG102);
                jdbcTemplate.update("INSERT INTO dbo.incurred_services (room_booking_id, room_number, category, detail, price, status) VALUES (?, '#S102', 'Room service', N'Ăn tối tại phòng: Cơm lứt muối mè & Nước ép hữu cơ', 320000.00, 'Completed')", bookingBG102);
                jdbcTemplate.update("INSERT INTO dbo.incurred_services (room_booking_id, room_number, category, detail, price, status) VALUES (?, '#S101', 'Laundry', N'Giặt khô đầm lụa tơ tằm', 180000.00, 'Pending')", bookingBG101);
                jdbcTemplate.update("INSERT INTO dbo.incurred_services (room_booking_id, room_number, category, detail, price, status) VALUES (?, '#S102', 'Tour booking', N'Tour ngắm hoàng hôn bán đảo Sơn Trà', 1500000.00, 'Completed')", bookingBG102);
                
                System.out.println("[DB Seeder] Successfully seeded initial incurred services.");

                // Trigger invoice recalculation for the seeded bookings if they exist
                if (bookingBG101 != null) {
                    jdbcTemplate.update("""
                        UPDATE dbo.invoice 
                        SET service_subtotal = (SELECT SUM(price) FROM dbo.incurred_services WHERE room_booking_id = ? AND status = 'Completed')
                        WHERE room_booking_id = ?
                        """, bookingBG101, bookingBG101);
                }
                if (bookingBG102 != null) {
                    jdbcTemplate.update("""
                        UPDATE dbo.invoice 
                        SET service_subtotal = (SELECT SUM(price) FROM dbo.incurred_services WHERE room_booking_id = ? AND status = 'Completed')
                        WHERE room_booking_id = ?
                        """, bookingBG102, bookingBG102);
                }
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Incurred services setup / seeding failed: " + e.getMessage());
        }

        // Seed fake invoices for months 1-5 of 2026 for dashboard display
        try {
            Integer countFakeBookings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dbo.room_booking WHERE check_in_date = '2026-01-10 14:00:00'", Integer.class);
            if (countFakeBookings != null && countFakeBookings == 0) {
                System.out.println("[DB Seeder] Seeding fake invoice data for January to May 2026...");
                // Ensure a guest user exists for these bookings
                seedUser("guest@nguson.com", "Khách Hàng Trải Nghiệm", "0909999999", "CUSTOMER");
                Integer userId = jdbcTemplate.queryForObject("SELECT user_id FROM dbo.users WHERE email = 'guest@nguson.com'", Integer.class);
                if (userId != null) {
                    String[] checkIns = {
                        "2026-01-10 14:00:00",
                        "2026-02-12 14:00:00",
                        "2026-03-15 14:00:00",
                        "2026-04-18 14:00:00",
                        "2026-05-20 14:00:00"
                    };
                    String[] checkOuts = {
                        "2026-01-13 12:00:00",
                        "2026-02-15 12:00:00",
                        "2026-03-18 12:00:00",
                        "2026-04-21 12:00:00",
                        "2026-05-23 12:00:00"
                    };
                    BigDecimal[] roomSubs = {
                        new BigDecimal("12000000.00"),
                        new BigDecimal("15000000.00"),
                        new BigDecimal("10000000.00"),
                        new BigDecimal("18000000.00"),
                        new BigDecimal("16000000.00")
                    };
                    BigDecimal[] spaSubs = {
                        new BigDecimal("2400000.00"),
                        new BigDecimal("1600000.00"),
                        new BigDecimal("3000000.00"),
                        new BigDecimal("0.00"),
                        new BigDecimal("4400000.00")
                    };
                    BigDecimal[] foodSubs = {
                        new BigDecimal("1600000.00"),
                        new BigDecimal("2400000.00"),
                        new BigDecimal("1000000.00"),
                        new BigDecimal("3600000.00"),
                        new BigDecimal("2000000.00")
                    };
                    BigDecimal[] taxFees = {
                        new BigDecimal("1600000.00"),
                        new BigDecimal("1900000.00"),
                        new BigDecimal("1400000.00"),
                        new BigDecimal("2160000.00"),
                        new BigDecimal("2240000.00")
                    };
                    BigDecimal[] finals = {
                        new BigDecimal("17600000.00"),
                        new BigDecimal("20900000.00"),
                        new BigDecimal("15400000.00"),
                        new BigDecimal("23760000.00"),
                        new BigDecimal("24640000.00")
                    };

                    for (int i = 0; i < 5; i++) {
                        jdbcTemplate.update(
                            "INSERT INTO dbo.room_booking (user_id, status, check_in_date, check_out_date, total_deposit, created_at) " +
                            "VALUES (?, 'CHECKED_OUT', ?, ?, ?, ?)",
                            userId, checkIns[i], checkOuts[i], finals[i].multiply(new BigDecimal("0.3")), checkIns[i]
                        );
                        Integer bookingId = jdbcTemplate.queryForObject("SELECT MAX(booking_id) FROM dbo.room_booking", Integer.class);
                        if (bookingId != null) {
                            jdbcTemplate.update(
                                "INSERT INTO dbo.invoice (user_id, room_booking_id, room_subtotal, spa_subtotal, food_subtotal, service_subtotal, tax_and_fees, final_amount, deposit_amount, amount_due, status, payment_time) " +
                                "VALUES (?, ?, ?, ?, ?, 0.00, ?, ?, ?, 0.00, 'PAID', ?)",
                                userId, bookingId, roomSubs[i], spaSubs[i], foodSubs[i], taxFees[i], finals[i], finals[i], checkOuts[i]
                            );
                        }
                    }
                    System.out.println("[DB Seeder] Successfully seeded fake invoices for months 1-5 of 2026.");
                }
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Fake invoice seeding failed: " + e.getMessage());
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

    private java.io.File findWorkspaceRoot() {
        java.io.File dir = new java.io.File(System.getProperty("user.dir"));
        while (dir != null) {
            if (new java.io.File(dir, "data_dong_bo").exists() || new java.io.File(dir, "05-Development").exists()) {
                return dir;
            }
            dir = dir.getParentFile();
        }
        return new java.io.File(System.getProperty("user.dir"));
    }

    private void executeSqlScript(java.io.File root, String relativePath) {
        try {
            java.io.File file = new java.io.File(root, relativePath);
            if (!file.exists()) {
                System.err.println("[DB Seeder] Script not found: " + file.getAbsolutePath());
                return;
            }
            System.out.println("[DB Seeder] Executing script: " + file.getAbsolutePath());
            String content = new String(java.nio.file.Files.readAllBytes(file.toPath()), java.nio.charset.StandardCharsets.UTF_8);
            
            // Split by GO on its own line (case insensitive)
            String[] statements = content.split("(?i)(?m)^\\s*GO\\s*$");
            for (String sql : statements) {
                sql = sql.trim();
                if (!sql.isEmpty()) {
                    jdbcTemplate.execute(sql);
                }
            }
            System.out.println("[DB Seeder] Successfully executed: " + file.getName());
        } catch (Exception e) {
            System.err.println("[DB Seeder] Error executing " + relativePath + ": " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private void syncDishImages(java.io.File root) {
        java.io.File sourceDir = new java.io.File(root, "03-Design/data_dong_bo/DATABASE/Anh Dũng/Anh/dishes");
        java.io.File targetDir = new java.io.File(root, "05-Development/frontend/public/images/dishes");
        if (!sourceDir.exists()) {
            System.out.println("[DB Seeder] Source dishes directory not found: " + sourceDir.getAbsolutePath());
            return;
        }
        if (!targetDir.exists()) {
            targetDir.mkdirs();
        }
        System.out.println("[DB Seeder] Syncing dish images from " + sourceDir.getName() + " to " + targetDir.getName() + "...");
        java.io.File[] files = sourceDir.listFiles();
        if (files != null) {
            int copied = 0;
            for (java.io.File f : files) {
                if (f.isFile()) {
                    java.io.File targetFile = new java.io.File(targetDir, f.getName());
                    try {
                        if (!targetFile.exists() || targetFile.length() != f.length()) {
                            java.nio.file.Files.copy(f.toPath(), targetFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                            copied++;
                        }
                    } catch (Exception e) {
                        System.err.println("[DB Seeder] Failed to copy image " + f.getName() + ": " + e.getMessage());
                    }
                }
            }
            System.out.println("[DB Seeder] Dish images sync completed. Copied " + copied + " new/changed images.");
        }
    }

    private void disableResetFlagInProperties(java.io.File root) {
        try {
            java.io.File propFile = new java.io.File(root, "05-Development/backend/src/main/resources/application.properties");
            if (propFile.exists()) {
                String content = new String(java.nio.file.Files.readAllBytes(propFile.toPath()), java.nio.charset.StandardCharsets.UTF_8);
                content = content.replace("app.db.reset-on-start=true", "app.db.reset-on-start=false");
                java.nio.file.Files.writeString(propFile.toPath(), content, java.nio.charset.StandardCharsets.UTF_8);
                System.out.println("[DB Seeder] Automatically disabled app.db.reset-on-start in application.properties");
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not disable reset flag in properties: " + e.getMessage());
        }
    }

    private void wipeDatabase() {
        System.out.println("[DB Seeder] Wiping all existing tables and constraints in ResortSpaDB...");
        try {
            // 1. Drop all foreign keys
            String dropFKs = 
                "DECLARE @sql NVARCHAR(MAX) = N'';\n" +
                "SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + \n" +
                "               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)\n" +
                "FROM sys.foreign_keys;\n" +
                "EXEC sp_executesql @sql;";
            jdbcTemplate.execute(dropFKs);
            System.out.println("[DB Seeder] All foreign keys dropped.");

            // 2. Drop all tables
            String dropTables = 
                "DECLARE @sql NVARCHAR(MAX) = N'';\n" +
                "SELECT @sql += N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';' + CHAR(13)\n" +
                "FROM sys.tables;\n" +
                "EXEC sp_executesql @sql;";
            jdbcTemplate.execute(dropTables);
            System.out.println("[DB Seeder] All tables dropped.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning during database wipe: " + e.getMessage());
        }
    }

    private void restoreMissingDishes(java.io.File root) {
        java.io.File dishesDir = new java.io.File(root, "05-Development/frontend/public/images/dishes");
        if (!dishesDir.exists()) {
            System.out.println("[DB Seeder] Dishes directory not found: " + dishesDir.getAbsolutePath());
            return;
        }
        java.io.File[] files = dishesDir.listFiles();
        if (files == null) return;

        System.out.println("[DB Seeder] Restoring missing dishes from image directory (30 Kids + 60 Adults) with matching Unsplash images...");
        int restoredCount = 0;
        int kidIdx = 0;
        int adultIdx = 0;
        
        String[] kidNames = {
            "Súp ngô gà nấm ngọt", "Cháo sườn non hạt sen", "Mì Ý sốt bò bằm phô mai",
            "Cơm chiên trứng cuộn Nhật Bản", "Khoai tây chiên lắc phô mai", "Gà viên chiên giòn mật ong",
            "Trứng cuộn phô mai mềm mịn", "Cháo cá hồi bông bí đỏ", "Sữa chua trái cây nhiệt đới",
            "Pudding xoài kem tươi", "Bánh flan caramen sữa tươi", "Nước cam vắt nguyên chất",
            "Sữa dâu tây hạt chia", "Súp bí đỏ kem tươi", "Nui xào bò bằm cà chua",
            "Bánh mì bơ tỏi nướng giòn", "Cháo lươn đồng nấu rau xanh", "Kem vani dâu tây ngọt mát",
            "Sinh tố chuối bơ sữa đặc", "Bánh pancake mật ong trái cây", "Cháo tôm tươi rau củ băm",
            "Trứng chưng thịt nấm hương", "Mì Udon nước dùng rau ngọt", "Xúc xích bạch tuộc chiên",
            "Bánh bao nhân đậu xanh sữa", "Nước ép dâu tây táo ngọt", "Sữa hạt điều vị vani",
            "Súp khoai tây cà rốt nghiền", "Nui sốt kem phô mai đút lò", "Cơm nắm rong biển tam giác"
        };

        String[] kidDescriptions = {
            "Súp ngọt thanh từ ngô ngọt, thịt gà xé sợi và nấm hương thơm ngon bổ dưỡng.",
            "Cháo ninh nhừ với sườn non và hạt sen giúp bé ăn ngon và ngủ sâu giấc.",
            "Mì Ý xốt bò bằm đậm đà kết hợp lớp phô mai béo ngậy hấp dẫn trẻ nhỏ.",
            "Cơm chiên hạt dẻo thơm được cuộn trong lớp trứng rán mỏng mềm mịn phong cách Nhật.",
            "Khoai tây chiên vàng giòn rắc bột phô mai mặn ngọt kích thích vị giác.",
            "Thịt ức gà viên tẩm bột chiên xù giòn tan rưới xốt mật ong ngọt dịu.",
            "Trứng rán cuộn lớp phô mai tan chảy thơm ngậy bên trong cực kỳ mềm mịn.",
            "Cháo dinh dưỡng từ cá hồi tươi giàu Omega-3 nấu cùng bí đỏ ngọt mát.",
            "Sữa chua lên men tự nhiên ăn kèm dâu tây, xoài và kiwi tươi cắt nhỏ.",
            "Món tráng miệng pudding mềm mịn hương xoài phủ kem tươi béo ngậy.",
            "Bánh flan làm từ trứng gà ta và sữa tươi nguyên chất, lớp đường caramen ngọt dịu.",
            "Nước cam vắt tươi giàu Vitamin C tăng cường hệ miễn dịch cho bé.",
            "Sữa tươi kết hợp dâu tây tươi xay nhuyễn và hạt chia thanh mát.",
            "Súp bí đỏ sánh mịn kết hợp kem tươi whipping thơm béo, dễ ăn.",
            "Nui ống xào cùng thịt bò băm tươi ngon và xốt cà chua tự chế biến.",
            "Bánh mì cắt lát phết bơ tỏi nướng giòn rụm thơm lừng.",
            "Cháo dinh dưỡng từ lươn đồng giàu đạm nấu với các loại rau củ xay nhuyễn.",
            "Kem ly vị vani truyền thống trang trí dâu tây tươi và xốt dâu.",
            "Sinh tố dinh dưỡng từ chuối chín, bơ sáp và sữa đặc tốt cho sức khỏe.",
            "Bánh pancake tự làm xốp mềm ăn kèm mật ong tự nhiên và trái cây tươi.",
            "Cháo gạo thơm nấu cùng tôm biển tươi băm nhỏ và rau củ theo mùa.",
            "Trứng gà ta chưng thịt băm và nấm hương mềm ngọt, đưa cơm.",
            "Mì Udon sợi mềm nấu trong nước dùng rau củ ngọt mát phù hợp với trẻ nhỏ.",
            "Xúc xích cắt hình bạch tuộc ngộ nghĩnh chiên giòn rụm chấm xốt cà chua.",
            "Bánh bao chay nhân đậu xanh thơm ngọt, vỏ bánh mềm xốp sữa tươi.",
            "Nước ép từ dâu tây Đà Lạt và táo đỏ hữu cơ ngọt thanh, dễ uống.",
            "Sữa hạt điều organic tự làm thơm bùi vị vani ngọt mát.",
            "Súp khoai tây cà rốt nghiền mịn dễ tiêu hóa cho các bé.",
            "Nui ống sốt kem sữa phô mai cheddar đút lò thơm ngậy vàng óng.",
            "Cơm nắm dẻo trộn gia vị và rong biển cắt nhỏ tạo hình tam giác."
        };

        String[] kidImages = {
            "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80"
        };

        String[] adultNames = {
            "Cá hồi áp chảo sốt chanh leo", "Ức gà áp chảo sốt rosemary", "Thịt bò sốt tiêu đen măng tây",
            "Salad bơ tôm áp chảo", "Canh sườn hầm ngũ quả", "Phở cuốn thịt bò rau thơm",
            "Tôm nướng muối ớt cay ngọt", "Salad cá ngừ sốt mè rang", "Gà hấp lá chanh truyền thống",
            "Bò kho bánh mì sả ớt", "Nấm đùi gà xào húng quế", "Súp gà nấm tuyết hạt sen",
            "Đậu hũ sốt Tứ Xuyên chay", "Cá chẽm hấp hành gừng thơm", "Salad ức gà nướng mật ong",
            "Canh chua cá bớp bông điên điển", "Bò cuộn lá lốt nướng than", "Tôm sú hấp nước dừa ngọt",
            "Mì gạo lứt xào hải sản", "Soup hải sản rong biển xanh", "Bánh mì đen sốt bơ trứng chần",
            "Cháo yến mạch tôm tươi nấm rơm", "Canh bóng thả thập cẩm", "Cơm gạo lứt thịt kho tàu",
            "Cá thu sốt cà chua thì là", "Salad bắp cải tím hạt điều", "Gỏi cuốn tôm thịt heo organic",
            "Thịt heo xá xíu mật ong rừng", "Nấm đông cô kho quẹt chay", "Canh gà hầm nhân sâm táo đỏ",
            "Cá tuyết hấp xì dầu Hồng Kông", "Mì Quảng ếch đồng truyền thống", "Salad xà lách Caesar",
            "Canh khoai mỡ nấu tôm bằm", "Bò nướng đá sốt vang đỏ", "Tôm rim ba chỉ cháy cạnh",
            "Cá lóc kho tộ miền Tây", "Gà rang muối sả ớt giòn", "Yến sào chưng đường phèn sen",
            "Salad ổi giòn tai heo", "Mực ống hấp gừng hành tươi", "Bông bí xào tỏi thơm",
            "Canh bí đỏ thịt băm hành hoa", "Cá hồi đút lò sốt kem tỏi", "Gà nướng mật ong Tây Bắc",
            "Bò sốt vang bánh mì nóng", "Salad rong biển tươi sốt mè", "Canh riêu cua bắp bò sườn non",
            "Cá điêu hồng chiên xù sốt me", "Đậu hũ chưng thịt băm trứng muối", "Rau củ luộc chấm kho quẹt",
            "Canh hến nấu cà chua mồng tơi", "Bò xào bông thiên lý", "Tôm rang thịt ba chỉ rim ngọt",
            "Cá mú đỏ hấp Hồng Kông", "Gà kho gừng sả đậm đà", "Soup nấm hạt sen chay",
            "Salad bơ bưởi tôm sông", "Canh rau ngót nấu thịt băm", "Cá hồi nướng muối ớt"
        };

        String[] adultDescriptions = {
            "Cá hồi Na Uy tươi ngon áp chảo chín tới, rưới sốt chanh leo chua ngọt thơm mát.",
            "Ức gà áp chảo thơm lừng hương thảo rosemary, giữ nguyên độ ẩm mềm mại.",
            "Thịt thăn bò mềm xào sốt tiêu đen cay nồng ăn kèm măng tây xanh nướng.",
            "Salad xà lách giòn rụm kết hợp bơ sáp cắt lát và tôm sú áp chảo ngọt thịt.",
            "Canh hầm thanh mát từ sườn non củ quả giúp bồi bổ cơ thể.",
            "Bánh phở mỏng cuộn thịt bò xào lăn và các loại rau thơm Việt Nam thanh mát.",
            "Tôm biển xiên que nướng mọi chấm muối ớt chanh cay nồng đậm vị.",
            "Rau salad tươi giòn trộn cá ngừ ngâm dầu và xốt mè rang Nhật Bản đậm đà.",
            "Thịt gà ta luộc chín tới, da vàng giòn xắt sợi chanh thơm phức.",
            "Thịt nạm bò ninh nhừ cùng sả ớt cay nồng ăn kèm bánh mì giòn nóng hổi.",
            "Nấm đùi gà dai giòn xào cùng lá húng quế thơm nồng đậm đà.",
            "Súp gà xé thanh nhẹ nấu nấm tuyết giòn sần sật và hạt sen hầm mềm.",
            "Đậu hũ non mềm mịn sốt cà xốt nấm hương cay nồng chuẩn vị Tứ Xuyên chay.",
            "File cá chẽm tươi hấp cách thủy cùng hành gừng cắt sợi thơm ngọt tự nhiên.",
            "Rau xanh tổng hợp trộn ức gà nướng mật ong rừng ngọt thơm và sốt giấm táo.",
            "Canh chua đặc sản miền Tây ngọt thanh từ cá bớp tươi và bông điên điển.",
            "Thịt bò băm cuốn lá lốt nướng than hoa thơm nức mũi chấm mắm nêm ngon tuyệt.",
            "Tôm sú tươi sống hấp nước dừa xiêm ngọt lịm thơm ngon béo bùi.",
            "Mì làm từ gạo lứt xào cùng mực, tôm và rau cải xanh giòn ngon lành mạnh.",
            "Nước dùng thanh ngọt nấu từ hải sản tổng hợp và rong biển tươi.",
            "Bánh mì đen lúa mạch phết bơ sáp dầm nhuyễn ăn kèm hai quả trứng chần.",
            "Yến mạch nguyên cám nấu cháo tôm tươi và nấm rơm ngọt nước bổ dưỡng.",
            "Canh bóng thả thập cẩm truyền thống thanh mát với bóng bì, giò sống và rau củ.",
            "Cơm gạo lứt ăn kèm thịt ba chỉ kho nhừ cùng trứng cút ngấm vị đậm đà.",
            "Cá thu tươi sốt cà chua thì là thơm thì là đặc trưng.",
            "Bắp cải tím bào mỏng trộn dầu olive hạt điều rang muối giòn bùi.",
            "Gỏi cuốn tôm luộc, thịt ba chỉ heo hữu cơ, rau sống thanh mát chấm tương lạc.",
            "Thịt xá xíu ướp mật ong rừng nướng lò vàng óng, vị mặn ngọt đậm đà.",
            "Nấm đông cô tươi kho quẹt sệt đậm vị mặn ngọt chấm rau củ luộc.",
            "Gà ta hầm nhân sâm tươi, táo đỏ và hạt sen bồi bổ sinh lực.",
            "Cá tuyết tươi hấp xì dầu tỏi ớt phong cách Hồng Kông ngọt bùi.",
            "Mì Quảng truyền thống sợi vàng óng ăn kèm thịt ếch đồng um nghệ.",
            "Rau xà lách romaine giòn rụm trộn xốt Caesar béo ngậy và bánh mì nướng.",
            "Canh khoai mỡ tím nấu tôm bằm nhỏ ngọt mát dễ ăn đưa cơm.",
            "Bò fillet nướng đá nóng ăn kèm sốt vang đỏ kiểu Pháp đậm đà.",
            "Tôm biển rim cháy cạnh cùng thịt ba chỉ giòn mỡ mặn ngọt đưa cơm.",
            "Cá lóc đồng kho tộ sền sệt nước màu dừa đậm đà vị miền Tây.",
            "Thịt đùi gà cắt viên rang muối sả giòn rụm bên ngoài mềm ngọt bên trong.",
            "Tổ yến chưng đường phèn hạt sen táo đỏ thượng hạng bồi bổ sức khỏe.",
            "Salad tai heo giòn sần sật trộn ổi xắt lát chua ngọt lạ miệng.",
            "Mực ống tươi hấp hành gừng xắt sợi giữ nguyên độ ngọt tự nhiên của mực.",
            "Bông bí ngô tươi xào tỏi thơm giòn ngọt nhẹ đưa cơm.",
            "Canh bí đỏ nấu thịt nạc băm và hành hoa ngọt bùi bổ não.",
            "Cá hồi áp chảo rồi đút lò cùng xốt kem tỏi béo ngậy thơm lừng.",
            "Gà nướng ướp gia vị mắc khén hạt dổi và mật ong rừng Tây Bắc.",
            "Bò sốt vang đậm đà ăn kèm bánh mì nóng giòn rụm.",
            "Salad rong biển tươi giòn sần sật rắc vừng rang sốt mè Nhật.",
            "Canh riêu cua ngọt đậm đà ăn kèm bắp bò chần và sườn non ninh mềm.",
            "Cá điêu hồng chiên xù giòn rụm rưới sốt mắm me chua ngọt cay cay.",
            "Đậu hũ non chưng cách thủy với thịt băm và lòng đỏ trứng muối bùi ngậy.",
            "Các loại rau củ luộc theo mùa chấm kho quẹt đậm đà mặn ngọt.",
            "Canh hến sông cà chua mồng tơi thanh mát giải nhiệt mùa hè.",
            "Thịt bò thăn mềm xào nhanh tay với bông thiên lý xanh giòn thơm ngọt.",
            "Tôm sú và thịt ba chỉ rim kẹo đường dừa mặn mặn ngọt ngọt cực hao cơm.",
            "Cá mú đỏ tươi hấp cùng nấm đông cô, hành hoa và xì dầu đặc chế.",
            "Gà ta kho gừng sả cay ấm đậm đà mâm cơm gia đình.",
            "Canh nấm đông cô tươi hầm hạt sen, táo đỏ chay thanh đạm.",
            "Salad bơ tươi, bưởi hồng da xanh kết hợp tôm sông ngọt thịt.",
            "Canh rau ngót tươi nấu thịt băm thanh mát dễ ăn tiêu hóa tốt.",
            "Cá hồi cắt miếng dày nướng mọi muối ớt chanh cay nồng kích thích."
        };

        for (java.io.File f : files) {
            if (f.isFile()) {
                String filename = f.getName();
                String lowerName = filename.toLowerCase();
                
                // Skip default placeholder images
                if (lowerName.startsWith("dish_chao_yen_mach") || lowerName.startsWith("dish_bun_gao_lut") ||
                    lowerName.startsWith("dish_banh_mi_trung") || lowerName.startsWith("dish_pho_bo") ||
                    lowerName.startsWith("dish_green_detox") || lowerName.startsWith("dish_tra_hoa_cuc") ||
                    lowerName.startsWith("dish_quinoa_salad") || lowerName.startsWith("dish_mi_soba") ||
                    lowerName.startsWith("dish_com_gao_lut") || lowerName.startsWith("dish_ca_hoi") ||
                    lowerName.startsWith("dish_chicken_soup") || lowerName.startsWith("dish_sup_bi_do") ||
                    lowerName.startsWith("dish_steak_wagyu") || lowerName.startsWith("dish_tom_su")) {
                    continue;
                }
                
                // Check if we already filled both quotas
                if (kidIdx >= 30 && adultIdx >= 60) {
                    break;
                }
                
                // Check if dish already exists in the database
                String urlPattern = "%/" + filename;
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE image_url LIKE ?", Integer.class, urlPattern);
                if (count != null && count == 0) {
                    if (kidIdx < 30) {
                        // Insert as Kid's dish
                        String dishName = kidNames[kidIdx];
                        String description = kidDescriptions[kidIdx];
                        String imageUrl = getFoodImageUrl(dishName, kidIdx);
                        double price = 50000.00 + (Math.abs(filename.hashCode()) % 8) * 10000.00;
                        
                        try {
                            jdbcTemplate.update(
                                "INSERT INTO food_menu (dish_name, description, price, dietary_tags, category, is_today_menu, sold_out, is_package_included, periods, available_days, enabled, image_url) " +
                                "VALUES (?, ?, ?, ?, ?, 1, 0, 1, 'Breakfast,Lunch,Dinner', '0,1,2,3,4,5,6', 1, ?)",
                                dishName,
                                description,
                                java.math.BigDecimal.valueOf(price),
                                "Kids, Healthy",
                                "Món trẻ em",
                                imageUrl
                            );
                            restoredCount++;
                            kidIdx++;
                        } catch (Exception e) {
                            System.err.println("[DB Seeder] Failed to insert kid dish " + dishName + ": " + e.getMessage());
                        }
                    } else if (adultIdx < 60) {
                        // Insert as Adult's dish
                        String dishName = adultNames[adultIdx];
                        String description = adultDescriptions[adultIdx];
                        String imageUrl = getFoodImageUrl(dishName, adultIdx);
                        double price = 120000.00 + (Math.abs(filename.hashCode()) % 20) * 10000.00;
                        
                        try {
                            jdbcTemplate.update(
                                "INSERT INTO food_menu (dish_name, description, price, dietary_tags, category, is_today_menu, sold_out, is_package_included, periods, available_days, enabled, image_url) " +
                                "VALUES (?, ?, ?, ?, ?, 1, 0, 1, 'Breakfast,Lunch,Dinner', '0,1,2,3,4,5,6', 1, ?)",
                                dishName,
                                description,
                                java.math.BigDecimal.valueOf(price),
                                "Healthy, Organic",
                                "Món chính",
                                imageUrl
                            );
                            restoredCount++;
                            adultIdx++;
                        } catch (Exception e) {
                            System.err.println("[DB Seeder] Failed to insert adult dish " + dishName + ": " + e.getMessage());
                        }
                    }
                } else {
                    // Already exists in DB - advance counts to prevent duplicate quota usage
                    try {
                        String cat = jdbcTemplate.queryForObject("SELECT category FROM food_menu WHERE image_url LIKE ?", String.class, urlPattern);
                        if ("Món trẻ em".equals(cat)) {
                            kidIdx++;
                        } else {
                            adultIdx++;
                        }
                    } catch (Exception e) {
                        // Ignore
                    }
                }
            }
        }
        System.out.println("[DB Seeder] Successfully restored " + restoredCount + " dishes (Kids: " + kidIdx + ", Adults: " + adultIdx + ").");
    }

    private String getFoodImageUrl(String dishName, int idx) {
        String name = dishName.toLowerCase();
        
        // 1. Salmon / Fish
        if (name.contains("cá hồi") || name.contains("salmon") || name.contains("cá mú") || name.contains("cá chẽm") || name.contains("cá lóc") || name.contains("cá tuyết") || name.contains("cá bớp")) {
            return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80";
        }
        // 2. Seafood / Shrimp / Squid / Crab
        if (name.contains("tôm") || name.contains("hải sản") || name.contains("mực") || name.contains("cua") || name.contains("hến") || name.contains("lươn")) {
            return "https://images.unsplash.com/photo-1559737607-3578909a3636?auto=format&fit=crop&w=800&q=80";
        }
        // 3. Steak / Beef
        if (name.contains("bò") || name.contains("beef") || name.contains("steak") || name.contains("sườn")) {
            return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
        }
        // 4. Chicken / Pork / Sausage / Duck
        if (name.contains("gà") || name.contains("heo") || name.contains("xúc xích") || name.contains("thịt băm") || name.contains("ếch") || name.contains("xá xíu") || name.contains("ba chỉ")) {
            return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80";
        }
        // 5. Soup / Porridge / Stew
        if (name.contains("soup") || name.contains("súp") || name.contains("canh") || name.contains("cháo") || name.contains("kho")) {
            return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80";
        }
        // 6. Spaghetti / Noodles / Pasta
        if (name.contains("mì") || name.contains("nui") || name.contains("pasta") || name.contains("udon") || name.contains("ramen") || name.contains("quảng")) {
            return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80";
        }
        // 7. Bread / Toast / Pancake
        if (name.contains("bánh mì") || name.contains("sandwich") || name.contains("pancake") || name.contains("waffle") || name.contains("crepe")) {
            return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80";
        }
        // 8. Dessert / Sweet / Pudding / Flan / Yogurt
        if (name.contains("pudding") || name.contains("flan") || name.contains("chè") || name.contains("sữa chua") || name.contains("kem") || name.contains("custard") || name.contains("su kem") || name.contains("muffin") || name.contains("ngũ cốc")) {
            return "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80";
        }
        // 9. Drinks / Juice / Tea / Milk
        if (name.contains("nước") || name.contains("sinh tố") || name.contains("sữa") || name.contains("trà") || name.contains("nước ép")) {
            return "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80";
        }
        // 10. Salad / Veg / Tofu
        if (name.contains("salad") || name.contains("xà lách") || name.contains("rau") || name.contains("bí") || name.contains("khoai") || name.contains("đậu hũ") || name.contains("nấm") || name.contains("bông bí") || name.contains("thiên lý")) {
            return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
        }
        
        // Fallbacks
        String[] fallbacks = {
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80"
        };
        return fallbacks[idx % fallbacks.length];
    }

    private void consolidateSqlFiles(java.io.File root) {
        try {
            java.io.File masterFile = new java.io.File(root, "03-Design/database/ResortSpaDB_Master.sql");
            java.io.File kidFile = new java.io.File(root, "05-Development/backend/src/main/resources/insert_kid_packages.sql");
            java.io.File voucherFile = new java.io.File(root, "05-Development/backend/src/main/resources/migration_add_voucher.sql");
            java.io.File patchFile = new java.io.File(root, "05-Development/backend/src/main/resources/patch_utf8.sql");
            java.io.File shiftsFile = new java.io.File(root, "05-Development/backend/src/main/resources/schema_shifts_inventory.sql");
            
            if (masterFile.exists() && (kidFile.exists() || voucherFile.exists() || patchFile.exists() || shiftsFile.exists())) {
                System.out.println("[DB Seeder] Consolidating all database scripts into a single ResortSpaDB_Master.sql...");
                
                StringBuilder sb = new StringBuilder();
                sb.append(new String(java.nio.file.Files.readAllBytes(masterFile.toPath()), java.nio.charset.StandardCharsets.UTF_8));
                sb.append("\n\nGO\n\n");
                
                if (kidFile.exists()) {
                    sb.append(new String(java.nio.file.Files.readAllBytes(kidFile.toPath()), java.nio.charset.StandardCharsets.UTF_8));
                    sb.append("\n\nGO\n\n");
                }
                if (voucherFile.exists()) {
                    sb.append(new String(java.nio.file.Files.readAllBytes(voucherFile.toPath()), java.nio.charset.StandardCharsets.UTF_8));
                    sb.append("\n\nGO\n\n");
                }
                if (shiftsFile.exists()) {
                    sb.append(new String(java.nio.file.Files.readAllBytes(shiftsFile.toPath()), java.nio.charset.StandardCharsets.UTF_8));
                    sb.append("\n\nGO\n\n");
                }
                if (patchFile.exists()) {
                    sb.append(new String(java.nio.file.Files.readAllBytes(patchFile.toPath()), java.nio.charset.StandardCharsets.UTF_8));
                    sb.append("\n\nGO\n\n");
                }
                
                // Write the consolidated file
                java.nio.file.Files.writeString(masterFile.toPath(), sb.toString(), java.nio.charset.StandardCharsets.UTF_8);
                System.out.println("[DB Seeder] Consolidated ResortSpaDB_Master.sql written successfully!");
                
                // Delete the separate files
                if (kidFile.exists()) kidFile.delete();
                if (voucherFile.exists()) voucherFile.delete();
                if (shiftsFile.exists()) shiftsFile.delete();
                if (patchFile.exists()) patchFile.delete();
                System.out.println("[DB Seeder] Cleanup of separate SQL files completed.");
            }
        } catch (Exception e) {
            System.err.println("[DB Seeder] Failed to consolidate SQL files: " + e.getMessage());
        }
    }
}