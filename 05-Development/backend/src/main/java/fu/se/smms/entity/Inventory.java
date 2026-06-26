package fu.se.smms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @Column(name = "id", nullable = false, length = 50)
    private String id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Column(name = "min_qty", nullable = false)
    private Integer minQty;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit;

    public Inventory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getMinQty() { return minQty; }
    public void setMinQty(Integer minQty) { this.minQty = minQty; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
