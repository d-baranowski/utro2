package com.inspirationparticle.utro.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        jwtUtil.setSecret("test-secret-key-for-testing-purposes-only");
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        String username = "testuser";
        String token = JwtUtil.generateToken(username);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void validateToken_ShouldReturnClaims() {
        String username = "testuser";
        String token = JwtUtil.generateToken(username);
        
        Claims claims = JwtUtil.validateToken(token);
        
        assertNotNull(claims);
        assertEquals(username, claims.getSubject());
    }

    @Test
    void validateToken_ShouldHandleInvalidToken() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> {
            JwtUtil.validateToken(invalidToken);
        });
    }
}