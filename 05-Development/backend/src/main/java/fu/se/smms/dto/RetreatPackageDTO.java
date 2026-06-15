package fu.se.smms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for RetreatPackage – used by UC6 (Search/Filter) and UC7 (Booking).
 */
public class RetreatPackageDTO {
    private Integer packageId;

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    @NotNull(message = "Duration days is required")
    private Integer durationDays;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    private String includes;
    private String status;

    // UC6 filter fields
    private String healthGoal;   // YOGA, WEIGHT_LOSS, STRESS_RELIEF, DETOX, GENERAL
    private String imageUrl;
    private Integer maxGuests;
    private LocalDateTime createdAt;

    public RetreatPackageDTO() {}

    public Integer getPackageId() { return packageId; }
    public void setPackageId(Integer packageId) { this.packageId = packageId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getIncludes() { return includes; }
    public void setIncludes(String includes) { this.includes = includes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHealthGoal() { return healthGoal; }
    public void setHealthGoal(String healthGoal) { this.healthGoal = healthGoal; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

