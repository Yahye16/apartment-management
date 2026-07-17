package Group6.Apartment.service;
import Group6.Apartment.entity.*;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.ApartmentUnitRepository;
import Group6.Apartment.repository.LeaseRepository;
import Group6.Apartment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor

public class LeaseService {
    private final LeaseRepository leaseRepository;
    private final ApartmentUnitRepository apartmentUnitRepository;
    private final ApartmentUnitService apartmentUnitService;
    private final TenantService tenantService;
    private final PaymentRepository paymentRepository;

    public List<Lease> findAll() {
        return leaseRepository.findAll();
    }

    public Lease findById(Long id) {
        return leaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lease not found with id: " + id));
    }

    @Transactional
    public Lease create(Long tenantId, Long unitId, Lease payload) {
        Tenant tenant = tenantService.findById(tenantId);
        ApartmentUnit unit = apartmentUnitService.findById(unitId);

        payload.setTenant(tenant);
        payload.setUnit(unit);
        payload.setLeaseStatus(LeaseStatus.ACTIVE);
        // The tenant owes the full month's rent as soon as the lease starts.
        // Balance is negative while rent is owed, and moves toward zero as
        // payments come in (see PaymentService).
        payload.setBalance(payload.getMonthlyRent().negate());

        unit.setStatus(UnitStatus.OCCUPIED);
        apartmentUnitRepository.save(unit);

        return leaseRepository.save(payload);
    }

    @Transactional
    public Lease update(Long id, Lease payload) {
        Lease existing = findById(id);

        // If the rent amount changed, shift the balance by the same amount so
        // payments already made against the old rent stay accurate.
        BigDecimal rentDifference = existing.getMonthlyRent().subtract(payload.getMonthlyRent());
        existing.setBalance(existing.getBalance().add(rentDifference));

        existing.setStartDate(payload.getStartDate());
        existing.setEndDate(payload.getEndDate());
        existing.setMonthlyRent(payload.getMonthlyRent());
        existing.setDepositAmount(payload.getDepositAmount());
        existing.setLeaseStatus(payload.getLeaseStatus());

        if (payload.getLeaseStatus() == LeaseStatus.TERMINATED || payload.getLeaseStatus() == LeaseStatus.EXPIRED) {
            ApartmentUnit unit = existing.getUnit();
            unit.setStatus(UnitStatus.AVAILABLE);
            apartmentUnitRepository.save(unit);
        }

        return leaseRepository.save(existing);
    }

    @Transactional
    public Lease updateBalance(Lease lease, java.math.BigDecimal delta) {
        lease.setBalance(lease.getBalance().add(delta));
        return leaseRepository.save(lease);
    }

    @Transactional
    public void delete(Long id) {
        Lease existing = findById(id);
        leaseRepository.delete(existing);
    }


    @Transactional
    public Lease recalculateBalance(Long id) {
        Lease lease = findById(id);
        BigDecimal totalPaid = paymentRepository.findByLeaseId(id).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        lease.setBalance(totalPaid.subtract(lease.getMonthlyRent()));
        return leaseRepository.save(lease);
    }

    // Runs the fix above across every lease at once - handy for a one-time cleanup.
    @Transactional
    public List<Lease> recalculateAllBalances() {
        List<Lease> all = leaseRepository.findAll();
        all.forEach(lease -> {
            BigDecimal totalPaid = paymentRepository.findByLeaseId(lease.getId()).stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            lease.setBalance(totalPaid.subtract(lease.getMonthlyRent()));
        });
        return leaseRepository.saveAll(all);
    }

}