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
            System.out.println("[DB Seeder] Altering columns to NVARCHAR and adding available_days...");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE retreat_packages ALTER COLUMN name NVARCHAR(200) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE spa_services ALTER COLUMN name NVARCHAR(150) NOT NULL");
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
            System.out.println("[DB Seeder] Updating Food Menu items...");
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
            } else {
                jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Steak Bò Wagyu', description=N'Thăn nội bò Wagyu nướng than hoa mềm tan, ăn kèm rau củ nướng.', dietary_tags='Meat, Keto', price=1250000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_steak_wagyu.png', is_package_included=0, periods='Dinner' WHERE food_id=13");
            }
            
            Integer count14 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food_menu WHERE food_id=14", Integer.class);
            if (count14 != null && count14 == 0) {
                jdbcTemplate.update("INSERT INTO food_menu (dish_name, description, dietary_tags, price, periods, is_today_menu, available_days, image_url, is_package_included) VALUES (N'Tôm Sú Rim Tỏi Ớt', N'Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.', 'Seafood, Spicy', 390000, 'Lunch,Dinner', 1, '0,1,2,3,4,5,6', '/images/dishes/dish_tom_su.png', 0)");
            } else {
                jdbcTemplate.update("UPDATE food_menu SET dish_name=N'Tôm Sú Rim Tỏi Ớt', description=N'Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.', dietary_tags='Seafood, Spicy', price=390000, available_days='0,1,2,3,4,5,6', image_url='/images/dishes/dish_tom_su.png', is_package_included=0, periods='Lunch,Dinner' WHERE food_id=14");
            }

            System.out.println("[DB Seeder] Food Menu items updated successfully.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Could not update Food Menu. Reason: " + e.getMessage());
        }

        seedUser("admin@nguson.com", "Administrator", "0900000000", "ADMIN");
        seedUser("staff@nguson.com", "Staff Member", "0900000001", "STAFF");
        seedUser("chef@nguson.com", "Chef Specialist", "0900000002", "CHEF");
        seedUser("therapist@nguson.com", "Therapist Specialist", "0900000003", "THERAPIST");
        seedUser("spa@nguson.com", "Spa Specialist", "0900000004", "THERAPIST");
        seedUser("yoga@nguson.com", "Yoga Trainer", "0900000005", "THERAPIST");
        seedUser("physio@nguson.com", "Physiotherapist", "0900000006", "THERAPIST");
    }

    private void seedUser(String email, String fullName, String phone, String role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("Password123"))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .status("ACTIVE")
                    .build();
            userRepository.save(user);
            System.out.println("[DB Seeder] Seeded user: " + email + " with role: " + role);
        }
    }
}
