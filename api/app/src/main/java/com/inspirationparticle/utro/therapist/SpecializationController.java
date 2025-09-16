package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class SpecializationController {

    @Autowired
    private SpecializationServiceImpl specializationService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.SpecializationService/GetSpecialization",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Specialization> getSpecialization(@RequestBody TherapistProto.GetSpecializationRequest request) {
        return specializationService.getSpecialization(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.SpecializationService/ListSpecializations",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.ListSpecializationsResponse> listSpecializations(@RequestBody TherapistProto.ListSpecializationsRequest request) {
        return specializationService.listSpecializations(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.SpecializationService/SearchSpecializations",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.SearchSpecializationsResponse> searchSpecializations(@RequestBody TherapistProto.SearchSpecializationsRequest request) {
        return specializationService.searchSpecializations(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.SpecializationService/GetSpecializationCategories",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.GetSpecializationCategoriesResponse> getSpecializationCategories(@RequestBody TherapistProto.GetSpecializationCategoriesRequest request) {
        return specializationService.getSpecializationCategories(request);
    }
}