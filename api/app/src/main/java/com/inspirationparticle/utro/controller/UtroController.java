package com.inspirationparticle.utro.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UtroController {
    @GetMapping("/public")
    public String publicEndpoint() {
        return "This is a public endpoint";
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @GetMapping("/secret")
    public String secret() {
        return "This is a secret endpoint";
    }
}
