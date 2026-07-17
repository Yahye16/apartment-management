package Group6.Apartment.service;

import Group6.Apartment.entity.*;
import Group6.Apartment.repository.ApartmentUnitRepository;
import Group6.Apartment.repository.LeaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LeaseExpiryScheduler {

    private final LeaseRepository leaseRepository;
    private final ApartmentUnitRepository apartmentUnitRepository;

    @Scheduled(cron = "0 0 * * * *") // saacad kasta
    @Transactional
    public void expireOverdueLeases() {
        LocalDate today = LocalDate.now();
        List<Lease> activeLeases = leaseRepository.findByLeaseStatus(LeaseStatus.ACTIVE);

        for (Lease lease : activeLeases) {
            if (lease.getEndDate() != null && lease.getEndDate().isBefore(today)) {
                lease.setLeaseStatus(LeaseStatus.EXPIRED);
                leaseRepository.save(lease);

                ApartmentUnit unit = lease.getUnit();
                if (unit.getStatus() == UnitStatus.OCCUPIED) {
                    unit.setStatus(UnitStatus.AVAILABLE);
                    apartmentUnitRepository.save(unit);
                }
            }
        }
    }
}