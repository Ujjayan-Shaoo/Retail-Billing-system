package com.retail.billing.config;

import com.retail.billing.entity.AppUser;
import com.retail.billing.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByUsername("Admin")) {
            AppUser admin = AppUser.builder()
                    .username("Admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin user created: Admin / admin@123");
        }
    }
}
