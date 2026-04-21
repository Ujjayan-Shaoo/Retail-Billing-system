package com.retail.billing.service;

import com.retail.billing.entity.Customer;
import com.retail.billing.exception.ResourceNotFoundException;
import com.retail.billing.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() { return customerRepository.findAll(); }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    public Optional<Customer> findByPhone(String phone) { return customerRepository.findByPhone(phone); }

    public Customer createCustomer(Customer customer) {
        if (customer.getPhone() != null && customerRepository.existsByPhone(customer.getPhone())) {
            throw new IllegalArgumentException("Phone already registered");
        }
        return customerRepository.save(customer);
    }

    public Customer findOrCreateWalkIn(String name, String phone) {
        if (phone != null && !phone.isBlank()) {
            return customerRepository.findByPhone(phone)
                    .orElseGet(() -> customerRepository.save(Customer.builder().name(name).phone(phone).build()));
        }
        return customerRepository.save(Customer.builder().name(name != null ? name : "Walk-in").build());
    }

    public Customer updateCustomer(Long id, Customer updated) {
        Customer c = getCustomerById(id);
        c.setName(updated.getName());
        c.setPhone(updated.getPhone());
        c.setEmail(updated.getEmail());
        return customerRepository.save(c);
    }

    public void deleteCustomer(Long id) { customerRepository.delete(getCustomerById(id)); }
}
