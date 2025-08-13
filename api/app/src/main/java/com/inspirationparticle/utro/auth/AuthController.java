package com.inspirationparticle.utro.auth;

import com.inspirationparticle.utro.user.UserService;
import com.inspirationparticle.utro.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // Form data login endpoint
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Map<String, String>> loginForm(@RequestParam String username, @RequestParam String password) {
        // TODO validate username/password
        
        // Create or update user on first login
        User user = userService.findOrCreateUser(username, null, null, "local", null);
        
        String token = JwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
    
    // JSON login endpoint
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> loginJson(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        // TODO validate username/password
        
        // Create or update user on first login
        User user = userService.findOrCreateUser(username, null, null, "local", null);
        
        String token = JwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
    
    // Connect RPC endpoint for AuthService.Login
    @PostMapping("/com.inspirationparticle.auth.v1.AuthService/Login")
    public ResponseEntity<Map<String, String>> connectLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        // TODO validate username/password
        
        // Create or update user on first login
        User user = userService.findOrCreateUser(username, null, null, "local", null);
        
        String token = JwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
