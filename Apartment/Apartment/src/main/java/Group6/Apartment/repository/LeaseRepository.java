package Group6.Apartment.repository;

import Group6.Apartment.entity.Lease;
import Group6.Apartment.entity.LeaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface LeaseRepository extends JpaRepository<Lease, Long>{
    List<Lease> findByUnitId(Long unitId);
    List<Lease> findByTenantId(Long tenantId);
    List<Lease> findByLeaseStatus(LeaseStatus status);
}
