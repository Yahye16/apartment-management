package Group6.Apartment.service;

import Group6.Apartment.entity.*;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.MaintenanceRequestRepository;
import Group6.Apartment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestService {
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final ApartmentUnitService apartmentUnitService;
    private final UserRepository userRepository;

    public List<MaintenanceRequest> findAll() {
        return maintenanceRequestRepository.findAll();
    }

    public MaintenanceRequest findById(Long id) {
        return maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    @Transactional
    public MaintenanceRequest create(Long unitId, MaintenanceRequest payload) {
        ApartmentUnit unit = apartmentUnitService.findById(unitId);
        payload.setUnit(unit);
        return maintenanceRequestRepository.save(payload);
    }

    @Transactional
    public MaintenanceRequest assignUser(Long id, Long userId) {
        MaintenanceRequest existing = findById(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        existing.setAssignedUser(user);
        return maintenanceRequestRepository.save(existing);
    }

    @Transactional
    public MaintenanceRequest update(Long id, MaintenanceRequest payload) {
        MaintenanceRequest existing = findById(id);
        existing.setTitle(payload.getTitle());
        existing.setDescription(payload.getDescription());
        existing.setPriority(payload.getPriority());
        existing.setStatus(payload.getStatus());

        if (payload.getStatus() == MaintenanceStatus.COMPLETED && existing.getCompletedDate() == null) {
            existing.setCompletedDate(LocalDate.now());
            ApartmentUnit unit = existing.getUnit();
            if (unit.getStatus() == UnitStatus.MAINTENANCE) {
                unit.setStatus(UnitStatus.AVAILABLE);
                apartmentUnitService.save(unit);
            }
        }

        return maintenanceRequestRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        MaintenanceRequest existing = findById(id);
        maintenanceRequestRepository.delete(existing);
    }
}
