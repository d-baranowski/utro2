package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto;
import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/utro.v1.SpecializationService")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SpecializationServiceImpl {

    @Autowired
    private SpecializationRepository specializationRepository;


    @PostMapping("/GetSpecialization")
    public ResponseEntity<TherapistProto.Specialization> getSpecialization(@RequestBody TherapistProto.GetSpecializationRequest request) {
        try {
            UUID id = UUID.fromString(request.getId());
            Optional<com.inspirationparticle.utro.therapist.Specialization> specialization = 
                specializationRepository.findById(id);
            
            if (specialization.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(TherapistProtoMapper.toProto(specialization.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/ListSpecializations")
    public ResponseEntity<TherapistProto.ListSpecializationsResponse> listSpecializations(@RequestBody TherapistProto.ListSpecializationsRequest request) {
        List<com.inspirationparticle.utro.therapist.Specialization> specializations;
        
        if (request.hasCategory()) {
            specializations = specializationRepository.findByCategoryAndIsActiveTrueOrderByNameEng(request.getCategory());
        } else {
            specializations = specializationRepository.findByIsActiveTrueOrderByNameEng();
        }

        List<TherapistProto.Specialization> protoSpecializations = specializations.stream()
            .map(TherapistProtoMapper::toProto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(TherapistProto.ListSpecializationsResponse.newBuilder()
            .addAllSpecializations(protoSpecializations)
            .build());
    }

    @PostMapping("/SearchSpecializations")
    public ResponseEntity<TherapistProto.SearchSpecializationsResponse> searchSpecializations(@RequestBody TherapistProto.SearchSpecializationsRequest request) {
        if (request.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<com.inspirationparticle.utro.therapist.Specialization> specializations = 
            specializationRepository.searchSpecializations(request.getQuery());

        List<TherapistProto.Specialization> protoSpecializations = specializations.stream()
            .map(TherapistProtoMapper::toProto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(TherapistProto.SearchSpecializationsResponse.newBuilder()
            .addAllSpecializations(protoSpecializations)
            .build());
    }

    @PostMapping("/GetSpecializationCategories")
    public ResponseEntity<TherapistProto.GetSpecializationCategoriesResponse> getSpecializationCategories(@RequestBody TherapistProto.GetSpecializationCategoriesRequest request) {
        List<String> categories = specializationRepository.findDistinctCategories();

        return ResponseEntity.ok(TherapistProto.GetSpecializationCategoriesResponse.newBuilder()
            .addAllCategories(categories)
            .build());
    }
}