package com.inspirationparticle.utro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow origins for development and production
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",     // Next.js dev server
            "http://localhost:3001",     // Alternative Next.js port
            "http://web:3000",          // Docker service name
            "https://inspirationparticle.com" // Production domain
        ));
        
        // Allow all standard HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow common headers including Authorization for JWT
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "Connect-Protocol-Version", // For Connect RPC
            "Connect-Accept-Encoding",
            "Connect-Content-Encoding",
            "X-Grpc-Web",
            "X-User-Agent",
            "traceparent", // OpenTelemetry trace header
            "tracestate"   // OpenTelemetry trace state header
        ));
        
        // Expose headers that the client might need
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Content-Length",
            "Date"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // How long the browser should cache preflight requests
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}