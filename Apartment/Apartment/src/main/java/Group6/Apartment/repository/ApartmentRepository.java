package Group6.Apartment.repository;

import Group6.Apartment.entity.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    List<Apartment> findByOwnerId(Long ownerId);
}
