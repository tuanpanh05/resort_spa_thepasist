package fu.se.smms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class SmmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmmsApplication.class, args);
    }
}
