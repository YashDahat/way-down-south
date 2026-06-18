package com.waydownsouth.config;

import com.waydownsouth.model.Role;
import com.waydownsouth.model.User;
import com.waydownsouth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    // The 'admin.name' property is not used in the User model or in the creation logic.
    // Removing it to align with the User model which only has email, passwordHash, and role.
    // private String adminName;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isEmpty()) {
            User adminUser = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(adminUser);
            System.out.println("Default admin user created with email: " + adminEmail);
        } else {
            System.out.println("Admin user already exists with email: " + adminEmail);
        }
    }
}