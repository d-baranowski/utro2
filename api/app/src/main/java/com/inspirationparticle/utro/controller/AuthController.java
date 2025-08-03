package com.inspirationparticle.utro.controller;

import com.inspirationparticle.utro.security.JwtUtil;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) {
        // TODO validate username/password
        return JwtUtil.generateToken(username);
    }
}
