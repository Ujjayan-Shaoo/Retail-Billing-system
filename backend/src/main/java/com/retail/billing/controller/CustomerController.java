package com.retail.billing.controller;

import com.retail.billing.entity.AppUser;
import com.retail.billing.entity.Customer;
import com.retail.billing.entity.Order;
import com.retail.billing.repository.AppUserRepository;
import com.retail.billing.service.CustomerService;
import com.retail.billing.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final OrderService orderService;
    private final AppUserRepository userRepository;

    // CUSTOMER: get own profile
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        AppUser user = userRepository.findByUsername(auth.getName()).orElseThrow();
        if (user.getCustomer() == null)
            return ResponseEntity.ok(Map.of("name", user.getUsername(), "phone", ""));
        return ResponseEntity.ok(user.getCustomer());
    }

    // ── ADMIN ONLY below ────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getByPhone(@PathVariable String phone) {
        return customerService.findByPhone(phone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<Order>> getOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getCustomerOrders(id));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createCustomer(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(Map.of("message", "Customer deleted"));
    }
}
