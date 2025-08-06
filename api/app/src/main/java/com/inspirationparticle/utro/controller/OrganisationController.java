package com.inspirationparticle.utro.controller;

import com.google.protobuf.Timestamp;
import com.inspirationparticle.organisation.v1.*;
import com.inspirationparticle.utro.entity.OrganisationMember;
import com.inspirationparticle.utro.entity.User;
import com.inspirationparticle.utro.repository.OrganisationMemberRepository;
import com.inspirationparticle.utro.repository.OrganisationRepository;
import com.inspirationparticle.utro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class OrganisationController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganisationMemberRepository organisationMemberRepository;
    
    @Autowired
    private OrganisationRepository organisationRepository;
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations")
    public ResponseEntity<GetMyOrganisationsResponse> getMyOrganisations(@RequestBody GetMyOrganisationsRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(GetMyOrganisationsResponse.newBuilder().build());
        }
        
        User user = userOpt.get();
        
        // Get all organisation memberships for the user
        List<OrganisationMember> memberships = organisationMemberRepository.findByUserIdWithOrganisation(user.getId());
        
        // Convert to protobuf response
        List<Organisation> organisations = memberships.stream()
            .map(membership -> {
                com.inspirationparticle.utro.entity.Organisation org = membership.getOrganisation();
                
                // Map member type
                MemberType memberType = MemberType.MEMBER_TYPE_UNSPECIFIED;
                if (membership.getMemberType() == OrganisationMember.MemberType.ADMINISTRATOR) {
                    memberType = MemberType.MEMBER_TYPE_ADMINISTRATOR;
                } else if (membership.getMemberType() == OrganisationMember.MemberType.MEMBER) {
                    memberType = MemberType.MEMBER_TYPE_MEMBER;
                }
                
                // Build the organisation message
                Organisation.Builder orgBuilder = Organisation.newBuilder()
                    .setId(org.getId())
                    .setName(org.getName())
                    .setMemberType(memberType);
                
                if (org.getDescription() != null) {
                    orgBuilder.setDescription(org.getDescription());
                }
                
                if (membership.getJoinedAt() != null) {
                    orgBuilder.setJoinedAt(Timestamp.newBuilder()
                        .setSeconds(membership.getJoinedAt().getEpochSecond())
                        .setNanos(membership.getJoinedAt().getNano())
                        .build());
                }
                
                if (org.getCreatedAt() != null) {
                    orgBuilder.setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(org.getCreatedAt().getEpochSecond())
                        .setNanos(org.getCreatedAt().getNano())
                        .build());
                }
                
                if (org.getUpdatedAt() != null) {
                    orgBuilder.setUpdatedAt(Timestamp.newBuilder()
                        .setSeconds(org.getUpdatedAt().getEpochSecond())
                        .setNanos(org.getUpdatedAt().getNano())
                        .build());
                }
                
                return orgBuilder.build();
            })
            .collect(Collectors.toList());
        
        GetMyOrganisationsResponse response = GetMyOrganisationsResponse.newBuilder()
            .addAllOrganisations(organisations)
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation")
    public ResponseEntity<CreateOrganisationResponse> createOrganisation(@RequestBody CreateOrganisationRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = userOpt.get();
        
        // Check if organisation name already exists
        if (organisationRepository.existsByName(request.getName())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Create new organisation
        com.inspirationparticle.utro.entity.Organisation orgEntity = new com.inspirationparticle.utro.entity.Organisation();
        orgEntity.setName(request.getName());
        if (!request.getDescription().isEmpty()) {
            orgEntity.setDescription(request.getDescription());
        }
        orgEntity = organisationRepository.save(orgEntity);
        
        // Create membership with ADMINISTRATOR role for the creator
        OrganisationMember membership = new OrganisationMember();
        membership.setUser(user);
        membership.setOrganisation(orgEntity);
        membership.setMemberType(OrganisationMember.MemberType.ADMINISTRATOR);
        organisationMemberRepository.save(membership);
        
        // Convert to protobuf response
        Organisation.Builder orgBuilder = Organisation.newBuilder()
            .setId(orgEntity.getId())
            .setName(orgEntity.getName())
            .setMemberType(MemberType.MEMBER_TYPE_ADMINISTRATOR);
        
        if (orgEntity.getDescription() != null) {
            orgBuilder.setDescription(orgEntity.getDescription());
        }
        
        if (membership.getJoinedAt() != null) {
            orgBuilder.setJoinedAt(Timestamp.newBuilder()
                .setSeconds(membership.getJoinedAt().getEpochSecond())
                .setNanos(membership.getJoinedAt().getNano())
                .build());
        }
        
        if (orgEntity.getCreatedAt() != null) {
            orgBuilder.setCreatedAt(Timestamp.newBuilder()
                .setSeconds(orgEntity.getCreatedAt().getEpochSecond())
                .setNanos(orgEntity.getCreatedAt().getNano())
                .build());
        }
        
        if (orgEntity.getUpdatedAt() != null) {
            orgBuilder.setUpdatedAt(Timestamp.newBuilder()
                .setSeconds(orgEntity.getUpdatedAt().getEpochSecond())
                .setNanos(orgEntity.getUpdatedAt().getNano())
                .build());
        }
        
        CreateOrganisationResponse response = CreateOrganisationResponse.newBuilder()
            .setOrganisation(orgBuilder.build())
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations")
    public ResponseEntity<SearchOrganisationsResponse> searchOrganisations(@RequestBody SearchOrganisationsRequest request) {
        List<com.inspirationparticle.utro.entity.Organisation> entities = organisationRepository.searchByNameOrDescription(request.getQuery());
        
        List<Organisation> organisations = entities.stream()
            .map(orgEntity -> {
                Organisation.Builder orgBuilder = Organisation.newBuilder()
                    .setId(orgEntity.getId())
                    .setName(orgEntity.getName());
                
                if (orgEntity.getDescription() != null) {
                    orgBuilder.setDescription(orgEntity.getDescription());
                }
                
                if (orgEntity.getCreatedAt() != null) {
                    orgBuilder.setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(orgEntity.getCreatedAt().getEpochSecond())
                        .setNanos(orgEntity.getCreatedAt().getNano())
                        .build());
                }
                
                if (orgEntity.getUpdatedAt() != null) {
                    orgBuilder.setUpdatedAt(Timestamp.newBuilder()
                        .setSeconds(orgEntity.getUpdatedAt().getEpochSecond())
                        .setNanos(orgEntity.getUpdatedAt().getNano())
                        .build());
                }
                
                return orgBuilder.build();
            })
            .collect(Collectors.toList());
        
        SearchOrganisationsResponse response = SearchOrganisationsResponse.newBuilder()
            .addAllOrganisations(organisations)
            .build();
        
        return ResponseEntity.ok(response);
    }
}