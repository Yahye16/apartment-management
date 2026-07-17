package Group6.Apartment.controller;


import Group6.Apartment.entity.Apartment;
import Group6.Apartment.service.ApartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor

public class ApartmentController {
    private final ApartmentService apartmentService;

    @GetMapping
    public List<Apartment> getAll(@RequestParam(required = false) Long ownerId) {
        if (ownerId != null) return apartmentService.findByOwner(ownerId);
        return apartmentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Apartment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentService.findById(id));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/owner/{ownerId}")
    public ResponseEntity<Apartment> create(@PathVariable Long ownerId, @Valid @RequestBody Apartment apartment) {
        return ResponseEntity.ok(apartmentService.create(ownerId, apartment));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Apartment> update(@PathVariable Long id, @Valid @RequestBody Apartment apartment) {
        return ResponseEntity.ok(apartmentService.update(id, apartment));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        apartmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
