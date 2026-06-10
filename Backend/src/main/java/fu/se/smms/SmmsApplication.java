package fu.se.smms;

import fu.se.smms.config.VNPayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(VNPayProperties.class)
public class SmmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmmsApplication.class, args);
    }
}
