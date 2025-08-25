package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/utro.v1.TherapistService")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TherapistServiceImpl {

    @Autowired
    private TherapistRepository therapistRepository;

    @Autowired
    private TherapistProtoMapper therapistProtoMapper;

    @PostMapping("/GetTherapist")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> getTherapist(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistRequest request) {
        try {
            UUID id = UUID.fromString(request.getId());
            Optional<com.inspirationparticle.utro.therapist.Therapist> therapist = therapistRepository.findById(id);

            if (therapist.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(therapistProtoMapper.toProto(therapist.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/GetTherapistBySlug")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> getTherapistBySlug(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistBySlugRequest request) {
        Optional<com.inspirationparticle.utro.therapist.Therapist> therapist = 
            therapistRepository.findBySlug(request.getSlug());
        
        if (therapist.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(therapistProtoMapper.toProto(therapist.get()));
    }

    @PostMapping("/GetTherapistByUser")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> getTherapistByUser(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistByUserRequest request) {
        try {
            UUID userId = UUID.fromString(request.getUserId());
            Optional<com.inspirationparticle.utro.therapist.Therapist> therapist = 
                therapistRepository.findByUserId(userId);
            
            if (therapist.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(therapistProtoMapper.toProto(therapist.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/ListTherapists")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.ListTherapistsResponse> listTherapists(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.ListTherapistsRequest request) {
        try {
            List<com.inspirationparticle.utro.therapist.Therapist> therapists;
            int totalCount = 0;

            // Apply filters based on request
            if (request.hasOrganisationId()) {
                UUID orgId = UUID.fromString(request.getOrganisationId());
                therapists = therapistRepository.findVisibleTherapists(orgId);
            } else if (request.hasSpecializationId()) {
                UUID specId = UUID.fromString(request.getSpecializationId());
                therapists = therapistRepository.findBySpecializationId(specId);
            } else if (request.hasLanguage()) {
                therapists = therapistRepository.findByLanguage(request.getLanguage());
            } else if (request.hasInPerson() || request.hasOnline()) {
                boolean inPerson = request.hasInPerson() && request.getInPerson();
                boolean online = request.hasOnline() && request.getOnline();
                therapists = therapistRepository.findByTherapyFormats(inPerson, online);
            } else if (request.hasAcceptingClients() && request.getAcceptingClients()) {
                therapists = therapistRepository.findByIsActiveTrueAndIsAcceptingNewClientsTrue();
            } else if (request.hasVisibility()) {
                com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility visibility = 
                    TherapistMapper.mapVisibilityFromProto(request.getVisibility());
                therapists = therapistRepository.findByVisibilityAndIsActiveTrue(visibility);
            } else {
                therapists = therapistRepository.findByVisibilityAndIsActiveTrue(
                    com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility.PUBLIC);
            }

            totalCount = therapists.size();

            // Apply pagination
            int pageSize = Math.max(1, request.getPageSize());
            int pageNumber = Math.max(0, request.getPageNumber());
            int start = pageNumber * pageSize;
            int end = Math.min(start + pageSize, therapists.size());

            if (start < therapists.size()) {
                therapists = therapists.subList(start, end);
            } else {
                therapists = List.of();
            }

            List<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> protoTherapists = therapists.stream()
                .map(therapistProtoMapper::toProto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(com.inspirationparticle.utro.gen.v1.TherapistProto.ListTherapistsResponse.newBuilder()
                .addAllTherapists(protoTherapists)
                .setTotalCount(totalCount)
                .setPageSize(pageSize)
                .setPageNumber(pageNumber)
                .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/SearchTherapists")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.SearchTherapistsResponse> searchTherapists(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.SearchTherapistsRequest request) {
        if (request.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        int pageSize = Math.max(1, request.getPageSize());
        int pageNumber = Math.max(0, request.getPageNumber());
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<com.inspirationparticle.utro.therapist.Therapist> therapistsPage = 
            therapistRepository.searchTherapists(request.getQuery(), pageable);

        List<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> protoTherapists = therapistsPage.getContent().stream()
            .map(therapistProtoMapper::toProto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(com.inspirationparticle.utro.gen.v1.TherapistProto.SearchTherapistsResponse.newBuilder()
            .addAllTherapists(protoTherapists)
            .setTotalCount((int) therapistsPage.getTotalElements())
            .setPageSize(pageSize)
            .setPageNumber(pageNumber)
            .build());
    }

    @PostMapping("/GetTherapistProfileImage")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistProfileImageResponse> getTherapistProfileImage(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistProfileImageRequest request) {
        try {
            UUID id = UUID.fromString(request.getId());
            Optional<com.inspirationparticle.utro.therapist.Therapist> therapist = therapistRepository.findById(id);
            
            if (therapist.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            if (therapist.get().getProfileImage() == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistProfileImageResponse.newBuilder()
                .setImageData(com.google.protobuf.ByteString.copyFrom(therapist.get().getProfileImage()))
                .setMimeType(therapist.get().getProfileImageMimeType() != null ? 
                    therapist.get().getProfileImageMimeType() : "image/jpeg")
                .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}