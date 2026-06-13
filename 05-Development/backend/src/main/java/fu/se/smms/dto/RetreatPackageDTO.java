package fu.se.smms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

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
}
