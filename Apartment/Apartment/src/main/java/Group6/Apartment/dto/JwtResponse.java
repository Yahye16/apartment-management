package Group6.Apartment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String role;
}