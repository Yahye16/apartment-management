package Group6.Apartment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApartments;
    private long totalUnits;
    private long occupiedUnits;
    private long availableUnits;
    private long maintenanceUnits;
    private long totalTenants;
    private long activeLeases;
    private BigDecimal monthlyRevenue;
    private Map<String, Long> paymentStatusBreakdown;
    private Map<String, Long> maintenanceStatusBreakdown;
}
