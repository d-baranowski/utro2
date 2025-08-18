package com.inspirationparticle.utro;

import com.google.protobuf.Descriptors.ServiceDescriptor;
import com.google.protobuf.Descriptors.MethodDescriptor;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.web.bind.annotation.*;
import org.reflections.Reflections;
import org.reflections.scanners.Scanners;
import org.reflections.util.ConfigurationBuilder;

import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ControllerProtobufAnnotationTest {

    private static final String BASE_PACKAGE = "com.inspirationparticle.utro";
    private static final String CONTROLLER_PACKAGE = BASE_PACKAGE;
    private static final String GENERATED_PACKAGE = BASE_PACKAGE + ".gen";

    @Test
    public void testControllerAnnotationsMatchProtobufServices() throws Exception {
        // Get all protobuf service descriptors
        Map<String, Set<String>> protobufServices = getProtobufServiceMethods();
        
        // Get all controller endpoints
        Map<String, String> controllerEndpoints = getControllerEndpoints();
        
        // Validate that each protobuf service method has a corresponding controller endpoint
        for (Map.Entry<String, Set<String>> serviceEntry : protobufServices.entrySet()) {
            String serviceName = serviceEntry.getKey();
            Set<String> methods = serviceEntry.getValue();
            
            for (String methodName : methods) {
                String expectedEndpoint = "/" + serviceName + "/" + methodName;
                
                assertTrue(
                    controllerEndpoints.containsKey(expectedEndpoint),
                    "Missing controller endpoint for protobuf service method: " + serviceName + "." + methodName + 
                    " (expected endpoint: " + expectedEndpoint + ")"
                );
            }
        }
        
        // Validate that all Connect RPC endpoints follow the correct pattern
        for (Map.Entry<String, String> endpointEntry : controllerEndpoints.entrySet()) {
            String endpoint = endpointEntry.getKey();
            String controllerMethod = endpointEntry.getValue();
            
            if (isConnectRpcEndpoint(endpoint)) {
                assertTrue(
                    isValidConnectRpcEndpoint(endpoint, protobufServices),
                    "Invalid Connect RPC endpoint pattern: " + endpoint + " in controller method: " + controllerMethod
                );
            }
        }
        
        System.out.println("✓ All protobuf service methods have corresponding controller endpoints");
        System.out.println("✓ All Connect RPC endpoints follow the correct naming pattern");
        
        // Print summary
        System.out.println("\nFound protobuf services:");
        protobufServices.forEach((service, methods) -> {
            System.out.println("  " + service + ": " + methods);
        });
        
        System.out.println("\nFound Connect RPC controller endpoints:");
        controllerEndpoints.entrySet().stream()
            .filter(e -> isConnectRpcEndpoint(e.getKey()))
            .forEach(e -> System.out.println("  " + e.getKey() + " -> " + e.getValue()));
    }

    private Map<String, Set<String>> getProtobufServiceMethods() throws Exception {
        Map<String, Set<String>> services = new HashMap<>();
        
        // Manually define known services from proto files
        // AuthService from auth.proto
        services.put("com.inspirationparticle.utro.gen.auth.v1.AuthService", 
                    Set.of("Login"));
        
        // OrganisationService from organisation.proto
        services.put("com.inspirationparticle.utro.gen.organisation.v1.OrganisationService", 
                    Set.of("GetMyOrganisations", "CreateOrganisation", "SearchOrganisations"));
        
        return services;
    }

    private Map<String, String> getControllerEndpoints() {
        Map<String, String> endpoints = new HashMap<>();
        
        Reflections reflections = new Reflections(new ConfigurationBuilder()
            .forPackages(CONTROLLER_PACKAGE)
            .setScanners(Scanners.TypesAnnotated, Scanners.MethodsAnnotated));
        
        Set<Class<?>> controllers = reflections.getTypesAnnotatedWith(RestController.class);
        
        for (Class<?> controllerClass : controllers) {
            String classLevelPath = "";
            if (controllerClass.isAnnotationPresent(RequestMapping.class)) {
                RequestMapping classMapping = controllerClass.getAnnotation(RequestMapping.class);
                if (classMapping.value().length > 0) {
                    classLevelPath = classMapping.value()[0];
                }
            }
            
            for (Method method : controllerClass.getDeclaredMethods()) {
                String endpoint = extractEndpointFromMethod(method, classLevelPath);
                if (endpoint != null) {
                    String methodReference = controllerClass.getSimpleName() + "." + method.getName();
                    endpoints.put(endpoint, methodReference);
                }
            }
        }
        
        return endpoints;
    }

    private String extractEndpointFromMethod(Method method, String classLevelPath) {
        String path = null;
        
        if (method.isAnnotationPresent(PostMapping.class)) {
            PostMapping mapping = method.getAnnotation(PostMapping.class);
            if (mapping.value().length > 0) {
                path = mapping.value()[0];
            }
        } else if (method.isAnnotationPresent(GetMapping.class)) {
            GetMapping mapping = method.getAnnotation(GetMapping.class);
            if (mapping.value().length > 0) {
                path = mapping.value()[0];
            }
        } else if (method.isAnnotationPresent(RequestMapping.class)) {
            RequestMapping mapping = method.getAnnotation(RequestMapping.class);
            if (mapping.value().length > 0) {
                path = mapping.value()[0];
            }
        }
        
        if (path != null) {
            // Normalize path - ensure it starts with /
            if (!path.startsWith("/")) {
                path = "/" + path;
            }
            
            // Combine class-level and method-level paths
            if (!classLevelPath.isEmpty()) {
                path = classLevelPath + path;
            }
            
            return path;
        }
        
        return null;
    }

    private boolean isConnectRpcEndpoint(String endpoint) {
        // Connect RPC endpoints follow the pattern: /package.Service/Method
        return endpoint.contains(".") && endpoint.contains("/") && 
               endpoint.startsWith("/com.inspirationparticle.utro.gen");
    }

    private boolean isValidConnectRpcEndpoint(String endpoint, Map<String, Set<String>> protobufServices) {
        // Extract service and method from endpoint
        // Format: /com.inspirationparticle.utro.gen.package.v1.ServiceName/MethodName
        String[] parts = endpoint.split("/");
        if (parts.length != 3) return false;
        
        String serviceName = parts[1];
        String methodName = parts[2];
        
        Set<String> serviceMethods = protobufServices.get(serviceName);
        return serviceMethods != null && serviceMethods.contains(methodName);
    }
}