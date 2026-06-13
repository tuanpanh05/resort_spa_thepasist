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
        // Fix font/Unicode issues in existing database by altering columns to NVARCHAR
        try {
            System.out.println("[DB Seeder] Altering columns to NVARCHAR to fix font/Unicode issues...");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE retreat_packages ALTER COLUMN name NVARCHAR(200) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE spa_services ALTER COLUMN name NVARCHAR(150) NOT NULL");
            System.out.println("[DB Seeder] Successfully upgraded database columns to NVARCHAR.");
        } catch (Exception e) {
            System.err.println("[DB Seeder] Warning: Could not alter database columns. Reason: " + e.getMessage());
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
