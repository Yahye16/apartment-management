package Group6.Apartment.controller;

import Group6.Apartment.dto.UserUpdateRequest;
import Group6.Apartment.entity.User;
import Group6.Apartment.security.UserPrincipal;
import Group6.Apartment.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // Waa admin kaliya oo arki kara liiska dadka is-diiwaangeliyay
    // (password-ka waa la ignore garaynayaa - fiiri @JsonIgnore ee User entity)
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // Admin-ka kaliya ayaa wax ka beddeli kara xogta shaqaalaha (fullName, email, role, status, iwm)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    // Admin-ka kaliya ayaa tirtiri kara shaqaale, laakiin ma tirtiri karo akoonkiisa
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new IllegalArgumentException("You cannot delete your own account.");
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}