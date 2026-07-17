package Group6.Apartment.repository;

import Group6.Apartment.entity.ApartmentUnit;
import Group6.Apartment.entity.UnitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApartmentUnitRepository extends JpaRepository<ApartmentUnit, Long>{
    List<ApartmentUnit> findByApartmentId(Long apartmentId);
    List<ApartmentUnit> findByStatus(UnitStatus status);
}
