package Group6.Apartment.service;
import Group6.Apartment.entity.Apartment;
import Group6.Apartment.entity.ApartmentUnit;
import Group6.Apartment.entity.UnitStatus;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.ApartmentUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApartmentUnitService {
    private final ApartmentUnitRepository apartmentUnitRepository;
    private final ApartmentService apartmentService;

    public List<ApartmentUnit> findAll() {
        return apartmentUnitRepository.findAll();
    }

    public ApartmentUnit findById(Long id) {
        return apartmentUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
    }

    public List<ApartmentUnit> findByApartment(Long apartmentId) {
        return apartmentUnitRepository.findByApartmentId(apartmentId);
    }

    public List<ApartmentUnit> findByStatus(UnitStatus status) {
        return apartmentUnitRepository.findByStatus(status);
    }

    @Transactional
    public ApartmentUnit create(Long apartmentId, ApartmentUnit unit) {
        Apartment apartment = apartmentService.findById(apartmentId);
        unit.setApartment(apartment);
        return apartmentUnitRepository.save(unit);
    }

    @Transactional
    public ApartmentUnit update(Long id, ApartmentUnit payload) {
        ApartmentUnit existing = findById(id);
        existing.setUnitNumber(payload.getUnitNumber());
        existing.setFloorNo(payload.getFloorNo());
        existing.setBedrooms(payload.getBedrooms());
        existing.setBathrooms(payload.getBathrooms());
        existing.setKitchens(payload.getKitchens());
        existing.setMonthlyRent(payload.getMonthlyRent());
        existing.setStatus(payload.getStatus());
        return apartmentUnitRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        ApartmentUnit existing = findById(id);
        apartmentUnitRepository.delete(existing);
    }

    public ApartmentUnit save(ApartmentUnit unit) {
        return apartmentUnitRepository.save(unit);
    }

}
