package Group6.Apartment.service;
import Group6.Apartment.entity.Tenant;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor

public class TenantService {
    private final TenantRepository tenantRepository;

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant findById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + id));
    }

    @Transactional
    public Tenant create(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant update(Long id, Tenant payload) {
        Tenant existing = findById(id);
        existing.setFullName(payload.getFullName());
        existing.setGender(payload.getGender());
        existing.setPhone(payload.getPhone());
        existing.setEmail(payload.getEmail());
        existing.setNationalId(payload.getNationalId());
        return tenantRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Tenant existing = findById(id);
        tenantRepository.delete(existing);
    }
}
