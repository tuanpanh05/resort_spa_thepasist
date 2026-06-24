package fu.se.smms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shifts")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "role", nullable = false, length = 100)
    private String role;

    @Column(name = "time", nullable = false, length = 100)
    private String time;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    public Shift() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
