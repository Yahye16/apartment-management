package Group6.Apartment.controller;

import Group6.Apartment.entity.ApartmentUnit;
import Group6.Apartment.entity.UnitStatus;
import Group6.Apartment.service.ApartmentUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class ApartmentUnitController {
    private final ApartmentUnitService apartmentUnitService;

    @GetMapping
    public List<ApartmentUnit> getAll(@RequestParam(required = false) Long apartmentId,
                                      @RequestParam(required = false) UnitStatus status) {
        if (apartmentId != null) return apartmentUnitService.findByApartment(apartmentId);
        if (status != null) return apartmentUnitService.findByStatus(status);
        return apartmentUnitService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartmentUnit> getById(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentUnitService.findById(id));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/apartment/{apartmentId}")
    public ResponseEntity<ApartmentUnit> create(@PathVariable Long apartmentId, @Valid @RequestBody ApartmentUnit unit) {
        return ResponseEntity.ok(apartmentUnitService.create(apartmentId, unit));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApartmentUnit> update(@PathVariable Long id, @Valid @RequestBody ApartmentUnit unit) {
        return ResponseEntity.ok(apartmentUnitService.update(id, unit));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        apartmentUnitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
