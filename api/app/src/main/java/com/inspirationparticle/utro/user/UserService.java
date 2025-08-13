package com.inspirationparticle.utro.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findOrCreateUser(String username, String email, String fullName, String provider, String providerId) {
        log.debug("Finding or creating user: username={}, email={}, provider={}", username, email, provider);
        Optional<User> existingUser = Optional.empty();
        
        if (providerId != null && provider != null) {
            existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        }
        
        if (existingUser.isEmpty() && username != null) {
            existingUser = userRepository.findByUsername(username);
        }
        
        if (existingUser.isEmpty() && email != null) {
            existingUser = userRepository.findByEmail(email);
        }
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            log.info("User found: id={}, username={}", user.getId(), user.getUsername());
            user.setLastLoginAt(Instant.now());
            return userRepository.save(user);
        } else {
            log.info("Creating new user: username={}, email={}", username, email);
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setProvider(provider != null ? provider : "local");
            newUser.setProviderId(providerId);
            newUser.setLastLoginAt(Instant.now());
            User savedUser = userRepository.save(newUser);
            log.info("New user created successfully: id={}", savedUser.getId());
            return savedUser;
        }
    }

    public Optional<User> findByUsername(String username) {
        log.debug("Finding user by username: {}", username);
        return userRepository.findByUsername(username);
    }

    public void updateLastLogin(User user) {
        log.debug("Updating last login for user: id={}", user.getId());
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
    }
}