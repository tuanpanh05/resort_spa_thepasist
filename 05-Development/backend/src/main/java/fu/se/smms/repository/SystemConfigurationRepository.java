package fu.se.smms.repository;

import fu.se.smms.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Integer> {
    Optional<SystemConfiguration> findByConfigKey(String configKey);
}
