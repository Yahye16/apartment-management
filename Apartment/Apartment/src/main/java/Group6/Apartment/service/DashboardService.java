package Group6.Apartment.service;
import Group6.Apartment.dto.DashboardStatsResponse;
import Group6.Apartment.entity.*;
import Group6.Apartment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ApartmentRepository apartmentRepository;
    private final ApartmentUnitRepository apartmentUnitRepository;
    private final TenantRepository tenantRepository;
    private final LeaseRepository leaseRepository;
    private final PaymentRepository paymentRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public DashboardStatsResponse getStats() {
        long totalApartments = apartmentRepository.count();

        List<ApartmentUnit> units = apartmentUnitRepository.findAll();
        long totalUnits = units.size();
        long occupied = units.stream().filter(u -> u.getStatus() == UnitStatus.OCCUPIED).count();
        long available = units.stream().filter(u -> u.getStatus() == UnitStatus.AVAILABLE).count();
        long maintenance = units.stream().filter(u -> u.getStatus() == UnitStatus.MAINTENANCE).count();

        long totalTenants = tenantRepository.count();

        List<Lease> leases = leaseRepository.findAll();
        long activeLeases = leases.stream().filter(l -> l.getLeaseStatus() == LeaseStatus.ACTIVE).count();

        BigDecimal monthlyRevenue = leases.stream()
                .filter(l -> l.getLeaseStatus() == LeaseStatus.ACTIVE)
                .map(Lease::getMonthlyRent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> paymentBreakdown = new HashMap<>();
        for (PaymentStatus status : PaymentStatus.values()) {
            paymentBreakdown.put(status.name(), (long) paymentRepository.findByPaymentStatus(status).size());
        }

        Map<String, Long> maintenanceBreakdown = new HashMap<>();
        for (MaintenanceStatus status : MaintenanceStatus.values()) {
            maintenanceBreakdown.put(status.name(), (long) maintenanceRequestRepository.findByStatus(status).size());
        }

        return new DashboardStatsResponse(
                totalApartments,
                totalUnits,
                occupied,
                available,
                maintenance,
                totalTenants,
                activeLeases,
                monthlyRevenue,
                paymentBreakdown,
                maintenanceBreakdown
        );
    }
}
