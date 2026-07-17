package Group6.Apartment.repository;

import Group6.Apartment.entity.MaintenanceRequest;
import Group6.Apartment.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long>{
    List<MaintenanceRequest> findByUnitId(Long unitId);
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);
    List<MaintenanceRequest> findByAssignedUserId(Long userId);
}
