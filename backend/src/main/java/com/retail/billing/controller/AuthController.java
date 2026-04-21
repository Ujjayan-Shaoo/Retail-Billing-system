package com.retail.billing.controller;

import com.retail.billing.entity.AppUser;
import com.retail.billing.entity.Customer;
import com.retail.billing.repository.AppUserRepository;
import com.retail.billing.repository.CustomerRepository;
import com.retail.billing.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Login (Admin or Customer) ─────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        AppUser user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        if (user.getCustomer() != null) {
            response.put("customerId", user.getCustomer().getId());
            response.put("customerName", user.getCustomer().getName());
        }
        return ResponseEntity.ok(response);
    }

    // ── Customer Self-Registration ────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String name     = body.get("name");
        String phone    = body.get("phone");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }

        // Create Customer record
        Customer customer = Customer.builder()
                .name(name != null ? name : username)
                .phone(phone)
                .build();
        customer = customerRepository.save(customer);

        // Create AppUser linked to customer
        AppUser user = AppUser.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role("CUSTOMER")
                .customer(customer)
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), "CUSTOMER");
        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", "CUSTOMER",
                "username", username,
                "customerId", customer.getId(),
                "customerName", customer.getName()
        ));
    }
}
