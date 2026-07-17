package Group6.Apartment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
//@Table(name = "apartment_units")
@Table(name = "apartmentunits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Long id;

//    @ManyToOne(fetch = FetchType.LAZY)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "apartment_id", nullable = false)
   // @NotNull
    private Apartment apartment;

    @NotBlank
    @Column(name = "unit_number", nullable = false, length = 20)
    private String unitNumber;

    @NotNull
    @Column(name = "floor_no", nullable = false)
    private Integer floorNo;

    @NotNull
    @Column(nullable = false)
    private Integer bedrooms;

    @NotNull
    @Column(nullable = false)
    private Integer bathrooms;

    @NotNull
    @Column(nullable = false)
    private Integer kitchens;

    @Positive
    @Column(name = "monthly_rent", nullable = false)
    private BigDecimal monthlyRent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnitStatus status = UnitStatus.AVAILABLE;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Lease> leases = new ArrayList<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MaintenanceRequest> maintenanceRequests = new ArrayList<>();
}
