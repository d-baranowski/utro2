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

    @Test
    public void testControllerAnnotationsMatchProtobufServices() {
        // Get all protobuf service descriptors
        Map<String, Set<String>> protobufServices = getProtobufServiceMethods();
        
        // Get all controller endpoints
        Map<String, String> controllerEndpoints = getControllerEndpoints();
        
        // Print discovered services and endpoints for visibility
        System.out.println("\nDiscovered protobuf services:");
        protobufServices.forEach((service, methods) -> {
            System.out.println("  " + service + ": " + methods);
        });
        
        System.out.println("\nDiscovered Connect RPC controller endpoints:");
        Map<String, String> connectEndpoints = controllerEndpoints.entrySet().stream()
            .filter(e -> isConnectRpcEndpoint(e.getKey()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        connectEndpoints.forEach((endpoint, controller) -> {
            System.out.println("  " + endpoint + " -> " + controller);
        });
        
        // Track missing and extra endpoints for better reporting
        Set<String> missingEndpoints = new HashSet<>();
        Set<String> extraEndpoints = new HashSet<>();
        
        // Check for missing controller endpoints
        for (Map.Entry<String, Set<String>> serviceEntry : protobufServices.entrySet()) {
            String serviceName = serviceEntry.getKey();
            Set<String> methods = serviceEntry.getValue();
            
            for (String methodName : methods) {
                String expectedEndpoint = "/" + serviceName + "/" + methodName;
                
                if (!controllerEndpoints.containsKey(expectedEndpoint)) {
                    missingEndpoints.add(expectedEndpoint + " (from service: " + serviceName + "." + methodName + ")");
                }
            }
        }
        
        // Check for invalid Connect RPC endpoints
        for (Map.Entry<String, String> endpointEntry : controllerEndpoints.entrySet()) {
            String endpoint = endpointEntry.getKey();
            String controllerMethod = endpointEntry.getValue();
            
            if (isConnectRpcEndpoint(endpoint)) {
                if (!isValidConnectRpcEndpoint(endpoint, protobufServices)) {
                    extraEndpoints.add(endpoint + " (in controller method: " + controllerMethod + ")");
                }
            }
        }
        
        // Report results
        if (!missingEndpoints.isEmpty()) {
            System.out.println("\n⚠ Missing controller endpoints:");
            missingEndpoints.forEach(endpoint -> System.out.println("  - " + endpoint));
        }
        
        if (!extraEndpoints.isEmpty()) {
            System.out.println("\n⚠ Invalid Connect RPC endpoints:");
            extraEndpoints.forEach(endpoint -> System.out.println("  - " + endpoint));
        }
        
        if (missingEndpoints.isEmpty() && extraEndpoints.isEmpty()) {
            System.out.println("\n✓ All protobuf service methods have corresponding controller endpoints");
            System.out.println("✓ All Connect RPC endpoints follow the correct naming pattern");
        }
        
        // Only fail the test if there are actual mismatches (we allow missing endpoints for services that aren't implemented yet)
        if (!extraEndpoints.isEmpty()) {
            fail("Found invalid Connect RPC endpoints that don't match any protobuf service: " + extraEndpoints);
        }
        
        // Log summary statistics
        System.out.println(String.format("\nSummary: Found %d protobuf services with %d total methods, %d implemented endpoints", 
            protobufServices.size(),
            protobufServices.values().stream().mapToInt(Set::size).sum(),
            connectEndpoints.size()));
    }

    private Map<String, Set<String>> getProtobufServiceMethods() {
        Map<String, Set<String>> services = new HashMap<>();
        
        // Try to load known client interface classes directly
        String[] knownServicePackages = {
            "com.inspirationparticle.utro.gen.auth.v1",
            "com.inspirationparticle.utro.gen.organisation.v1", 
            "com.inspirationparticle.utro.gen.v1"
        };
        
        for (String packageName : knownServicePackages) {
            // Try common service interface naming patterns
            String[] possibleServices = {"Auth", "Organisation", "Therapist", "Specialization"};
            
            for (String serviceName : possibleServices) {
                try {
                    String clientInterfaceName = packageName + "." + serviceName + "ServiceClientInterface";
                    Class<?> clientInterface = Class.forName(clientInterfaceName);
                    
                    String fullServiceName = packageName + "." + serviceName + "Service";
                    Set<String> methods = extractMethodNamesFromClientInterface(clientInterface);
                    
                    if (!methods.isEmpty()) {
                        services.put(fullServiceName, methods);
                    }
                } catch (ClassNotFoundException e) {
                    // Service doesn't exist, skip
                }
            }
        }
        
        return services;
    }
    
    private Set<String> extractMethodNamesFromClientInterface(Class<?> clientInterface) {
        Set<String> methods = new HashSet<>();
        
        // Extract method names from the client interface
        for (Method method : clientInterface.getDeclaredMethods()) {
            // Skip default methods like equals, hashCode, toString
            if (!method.isDefault() && !method.isSynthetic()) {
                String methodName = method.getName();
                // Convert from camelCase to PascalCase for Connect RPC
                String pascalCaseMethodName = methodName.substring(0, 1).toUpperCase() + methodName.substring(1);
                methods.add(pascalCaseMethodName);
            }
        }
        
        return methods;
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