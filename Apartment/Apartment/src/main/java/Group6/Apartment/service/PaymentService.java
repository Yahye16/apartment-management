package Group6.Apartment.service;

import Group6.Apartment.entity.Lease;
import Group6.Apartment.entity.Payment;
import Group6.Apartment.exception.ResourceNotFoundException;
import Group6.Apartment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final LeaseService leaseService;

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public List<Payment> findByLease(Long leaseId) {
        return paymentRepository.findByLeaseId(leaseId);
    }

    @Transactional
    public Payment create(Long leaseId, Payment payload) {
        Lease lease = leaseService.findById(leaseId);
        payload.setLease(lease);
        Payment saved = paymentRepository.save(payload);


        leaseService.updateBalance(lease, payload.getAmount());

        return saved;
    }

    @Transactional
    public Payment update(Long id, Payment payload) {
        Payment existing = findById(id);
        Lease lease = existing.getLease();

        BigDecimal adjustment = payload.getAmount().subtract(existing.getAmount());
        leaseService.updateBalance(lease, adjustment);

        existing.setAmount(payload.getAmount());
        existing.setPaymentDate(payload.getPaymentDate());
        existing.setPaymentMethod(payload.getPaymentMethod());
        existing.setPaymentStatus(payload.getPaymentStatus());
        return paymentRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Payment existing = findById(id);
        Lease lease = existing.getLease();

        leaseService.updateBalance(lease, existing.getAmount().negate());

        paymentRepository.delete(existing);
    }
}