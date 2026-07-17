package Group6.Apartment.service;

import Group6.Apartment.dto.UserUpdateRequest;
import Group6.Apartment.entity.User;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User update(Long id, UserUpdateRequest request) {
        User existing = findById(id);

        if (!existing.getUsername().equalsIgnoreCase(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (!existing.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()
                && !request.getPhone().equals(existing.getPhone())
                && userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone is already in use!");
        }

        existing.setFullName(request.getFullName());
        existing.setUsername(request.getUsername());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setRole(request.getRole());
        existing.setStatus(request.getStatus());

        return userRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        User existing = findById(id);
        userRepository.delete(existing);
    }
}