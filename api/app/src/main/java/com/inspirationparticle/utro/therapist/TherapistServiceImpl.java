package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto.*;
import com.inspirationparticle.utro.organisation.MemberType;
import com.inspirationparticle.utro.organisation.OrganisationMemberRepository;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
    private TherapistService therapistService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganisationMemberRepository organisationMemberRepository;

    @PostMapping("/GetTherapist")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> getTherapist(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.GetTherapistRequest request) {
        try {
            UUID id = UUID.fromString(request.getId());
            Optional<com.inspirationparticle.utro.therapist.Therapist> therapist = therapistRepository.findById(id);

            if (therapist.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist.get()));
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
        
        return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist.get()));
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
            
            return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/ListTherapists")
    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.ListTherapistsResponse> listTherapists(@RequestBody com.inspirationparticle.utro.gen.v1.TherapistProto.ListTherapistsRequest request) {
        try {
            List<com.inspirationparticle.utro.therapist.Therapist> therapists;
            int totalCount = 0;

            // Get current user if authenticated
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = null;
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
            }

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

            // Filter out unpublished therapists unless user is authorized
            List<com.inspirationparticle.utro.therapist.Therapist> filteredTherapists = new ArrayList<>();
            for (com.inspirationparticle.utro.therapist.Therapist therapist : therapists) {
                boolean canView = false;
                
                // Always show published therapists
                if (therapist.getPublishedAt() != null) {
                    canView = true;
                } else if (currentUser != null) {
                    // Show unpublished if user is the therapist
                    if (therapist.getUser().getId().equals(currentUser.getId())) {
                        canView = true;
                    } else {
                        // Show unpublished if user is org admin
                        var membership = organisationMemberRepository
                            .findByUserIdAndOrganisationId(currentUser.getId(), therapist.getOrganisation().getId());
                        if (membership.isPresent() && membership.get().getMemberType() == MemberType.ADMINISTRATOR) {
                            canView = true;
                        }
                    }
                }
                
                if (canView) {
                    filteredTherapists.add(therapist);
                }
            }
            therapists = filteredTherapists;

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
                .map(TherapistProtoMapper::toProto)
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
            .map(TherapistProtoMapper::toProto)
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

    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> createTherapist(
            com.inspirationparticle.utro.gen.v1.TherapistProto.CreateTherapistRequest request, String username) {
        return therapistService.createTherapist(request, username);
    }

    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> updateTherapist(
            com.inspirationparticle.utro.gen.v1.TherapistProto.UpdateTherapistRequest request, String username) {
        return therapistService.updateTherapist(request, username);
    }

    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.DeleteTherapistResponse> deleteTherapist(
            com.inspirationparticle.utro.gen.v1.TherapistProto.DeleteTherapistRequest request, String username) {
        return therapistService.deleteTherapist(request, username);
    }

    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> publishTherapist(
            com.inspirationparticle.utro.gen.v1.TherapistProto.PublishTherapistRequest request, String username) {
        return therapistService.publishTherapist(request, username);
    }

    public ResponseEntity<com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist> unpublishTherapist(
            com.inspirationparticle.utro.gen.v1.TherapistProto.UnpublishTherapistRequest request, String username) {
        return therapistService.unpublishTherapist(request, username);
    }
}