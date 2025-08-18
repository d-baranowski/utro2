package com.inspirationparticle.utro.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test/users")
@Profile({"dev", "test", "local"})  // Only active in non-production profiles
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // Create a test user (only for testing purposes)
    @PostMapping
    public ResponseEntity<Map<String, String>> createTestUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }
        
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
        }
        
        // Create user with hashed password
        User user = new User();
        user.setUsername(username);
        user.setEmail(email != null ? email : username + "@test.com");
        user.setFullName("Test User " + username);
        user.setProvider("local");
        user.setPassword(passwordEncoder.encode(password));
        
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
            "message", "User created successfully",
            "userId", user.getId(),
            "username", user.getUsername()
        ));
    }
    
    // Delete a test user (only for testing purposes)
    @DeleteMapping("/{username}")
    public ResponseEntity<Map<String, String>> deleteTestUser(@PathVariable String username) {
        var user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.delete(user.get());
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
    
    // Check if user exists
    @GetMapping("/{username}/exists")
    public ResponseEntity<Map<String, Boolean>> userExists(@PathVariable String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}