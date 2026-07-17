package Group6.Apartment.service;

import Group6.Apartment.entity.Owner;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerService {
    private final OwnerRepository ownerRepository;

    public List<Owner> findAll() {
        return ownerRepository.findAll();
    }

    public Owner findById(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + id));
    }

    @Transactional
    public Owner create(Owner owner) {
        return ownerRepository.save(owner);
    }

    @Transactional
    public Owner update(Long id, Owner payload) {
        Owner existing = findById(id);
        existing.setOwnerName(payload.getOwnerName());
        existing.setPhone(payload.getPhone());
        existing.setEmail(payload.getEmail());
        existing.setAddress(payload.getAddress());

        return ownerRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Owner existing = findById(id);
        ownerRepository.delete(existing);
    }
}
