package Group6.Apartment.controller;

import Group6.Apartment.entity.MaintenanceRequest;
import Group6.Apartment.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
@RequiredArgsConstructor
public class MaintenanceRequestController {
    private final MaintenanceRequestService maintenanceRequestService;

    @GetMapping
    public List<MaintenanceRequest> getAll() {
        return maintenanceRequestService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceRequestService.findById(id));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PostMapping("/unit/{unitId}")
    public ResponseEntity<MaintenanceRequest> create(@PathVariable Long unitId,
                                                     @Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceRequestService.create(unitId, request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PutMapping("/{id}/assign/{userId}")
    public ResponseEntity<MaintenanceRequest> assign(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(maintenanceRequestService.assignUser(id, userId));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceRequestService.update(id, request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
