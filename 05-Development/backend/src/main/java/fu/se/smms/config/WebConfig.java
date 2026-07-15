package fu.se.smms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        java.io.File dir = new java.io.File(System.getProperty("user.dir"));
        java.io.File root = dir;
        while (dir != null) {
            if (new java.io.File(dir, "data_dong_bo").exists() || new java.io.File(dir, "05-Development").exists()) {
                root = dir;
                break;
            }
            dir = dir.getParentFile();
        }
        java.io.File dishesDir = new java.io.File(root, "05-Development/frontend/public/images/dishes");
        String path = "file:///" + dishesDir.getAbsolutePath().replace("\\", "/") + "/";
        registry.addResourceHandler("/images/dishes/**")
                .addResourceLocations(path);
    }
}
