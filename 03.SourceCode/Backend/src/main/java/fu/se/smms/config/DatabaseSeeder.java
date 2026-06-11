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

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin@nguson.com", "Administrator", "0900000000", "ADMIN");
        seedUser("staff@nguson.com", "Staff Member", "0900000001", "STAFF");
        seedUser("chef@nguson.com", "Chef Specialist", "0900000002", "CHEF");
        seedUser("therapist@nguson.com", "Therapist Specialist", "0900000003", "THERAPIST");
        seedUser("spa@nguson.com", "Spa Specialist", "0900000004", "SPA");
        seedUser("yoga@nguson.com", "Yoga Trainer", "0900000005", "YOGA");
        seedUser("physio@nguson.com", "Physiotherapist", "0900000006", "PHYSIO");
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
