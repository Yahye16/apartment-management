package Group6.Apartment.controller;

import Group6.Apartment.entity.Lease;
import Group6.Apartment.service.LeaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leases")
@RequiredArgsConstructor
public class LeaseController {
    private final LeaseService leaseService;

    @GetMapping
    public List<Lease> getAll() {
        return leaseService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lease> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leaseService.findById(id));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PostMapping("/tenant/{tenantId}/unit/{unitId}")
    public ResponseEntity<Lease> create(@PathVariable Long tenantId, @PathVariable Long unitId,
                                        @Valid @RequestBody Lease lease) {
        return ResponseEntity.ok(leaseService.create(tenantId, unitId, lease));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<Lease> update(@PathVariable Long id, @Valid @RequestBody Lease lease) {
        return ResponseEntity.ok(leaseService.update(id, lease));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaseService.delete(id);
        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/recalculate-balances")
    public ResponseEntity<List<Lease>> recalculateAllBalances() {
        return ResponseEntity.ok(leaseService.recalculateAllBalances());
    }
}