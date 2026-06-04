package fu.se.smms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "[User]")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private String idPassportEncrypted;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
