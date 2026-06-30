package fu.se.smms.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for carrying forecasted revenue data and AI-generated insights.
 */
public class RevenueForecastDTO {
    private List<ForecastItem> forecastData;
    private String aiAnalysis;
    private String methodUsed; // "Gemini AI" or "Linear Regression (Offline)"

    public RevenueForecastDTO() {}

    public RevenueForecastDTO(List<ForecastItem> forecastData, String aiAnalysis, String methodUsed) {
        this.forecastData = forecastData;
        this.aiAnalysis = aiAnalysis;
        this.methodUsed = methodUsed;
    }

    public List<ForecastItem> getForecastData() {
        return forecastData;
    }

    public void setForecastData(List<ForecastItem> forecastData) {
        this.forecastData = forecastData;
    }

    public String getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(String aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }

    public String getMethodUsed() {
        return methodUsed;
    }

    public void setMethodUsed(String methodUsed) {
        this.methodUsed = methodUsed;
    }

    public static class ForecastItem {
        private String label; // e.g., "Tháng 07/2026"
        private BigDecimal roomRevenue;
        private BigDecimal spaRevenue;
        private BigDecimal foodRevenue;
        private BigDecimal totalRevenue;

        public ForecastItem() {}

        public ForecastItem(String label, BigDecimal roomRevenue, BigDecimal spaRevenue, BigDecimal foodRevenue) {
            this.label = label;
            this.roomRevenue = roomRevenue;
            this.spaRevenue = spaRevenue;
            this.foodRevenue = foodRevenue;
            this.totalRevenue = roomRevenue.add(spaRevenue).add(foodRevenue);
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public BigDecimal getRoomRevenue() { return roomRevenue; }
        public void setRoomRevenue(BigDecimal roomRevenue) { this.roomRevenue = roomRevenue; }
        public BigDecimal getSpaRevenue() { return spaRevenue; }
        public void setSpaRevenue(BigDecimal spaRevenue) { this.spaRevenue = spaRevenue; }
        public BigDecimal getFoodRevenue() { return foodRevenue; }
        public void setFoodRevenue(BigDecimal foodRevenue) { this.foodRevenue = foodRevenue; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }
}
