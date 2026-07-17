package Group6.Apartment.controller;

import Group6.Apartment.entity.Tenant;
import Group6.Apartment.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class  TenantController {
    private final TenantService tenantService;

    @GetMapping
    public List<Tenant> getAll() {
        return tenantService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.findById(id));
    }


    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PostMapping
    public ResponseEntity<Tenant> create(@Valid @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.create(tenant));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<Tenant> update(@PathVariable Long id, @Valid @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.update(id, tenant));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tenantService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
