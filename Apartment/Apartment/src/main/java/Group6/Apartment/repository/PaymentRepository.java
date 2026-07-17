package Group6.Apartment.repository;

import Group6.Apartment.entity.Payment;
import Group6.Apartment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long>{
    List<Payment> findByLeaseId(Long leaseId);
    List<Payment> findByPaymentStatus(PaymentStatus status);
}
