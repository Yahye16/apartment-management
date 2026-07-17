package Group6.Apartment.service;

import Group6.Apartment.entity.Apartment;
import Group6.Apartment.entity.Owner;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.ApartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final OwnerService ownerService;

    public List<Apartment> findAll() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with id: " + id));
    }

    public List<Apartment> findByOwner(Long ownerId) {
        return apartmentRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Apartment create(Long ownerId, Apartment apartment) {
        Owner owner = ownerService.findById(ownerId);
        apartment.setOwner(owner);
        return apartmentRepository.save(apartment);
    }

    @Transactional
    public Apartment update(Long id, Apartment payload) {
        Apartment existing = findById(id);
        existing.setApartmentName(payload.getApartmentName());
        existing.setAddress(payload.getAddress());
        existing.setTotalFloors(payload.getTotalFloors());
        existing.setTotalUnits(payload.getTotalUnits());
        existing.setDescription(payload.getDescription());
        existing.setStatus(payload.getStatus());
        return apartmentRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Apartment existing = findById(id);
        apartmentRepository.delete(existing);
    }
}
