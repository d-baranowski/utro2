package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.organisation.MemberType;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.organisation.OrganisationMember;
import com.inspirationparticle.utro.organisation.OrganisationMemberRepository;
import com.inspirationparticle.utro.organisation.OrganisationRepository;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class TherapistService {
    private final TherapistRepository therapistRepository;
    private final UserRepository userRepository;
    private final OrganisationMemberRepository organisationMemberRepository;
    private final OrganisationRepository organisationRepository;

    @Transactional
    public ResponseEntity<TherapistProto.Therapist> createTherapist(
            TherapistProto.CreateTherapistRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID organisationId = UUID.fromString(request.getOrganisationId());
        UUID targetUserId = UUID.fromString(request.getUserId());
        
        // Check if current user is admin of the organisation
        if (!isOrganisationAdmin(currentUser.getId(), organisationId)) {
            throw new AccessDeniedException("Only organisation administrators can create therapists");
        }

        // Check if target user exists
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        // Check if therapist already exists for this user
        if (therapistRepository.findByUserId(targetUserId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Get organisation
        Organisation organisation = organisationRepository.findById(organisationId)
                .orElseThrow(() -> new IllegalArgumentException("Organisation not found"));

        // Create new therapist using mapper
        Therapist therapist = TherapistRequestMapper.fromCreateRequest(request, targetUser, organisation);

        therapist = therapistRepository.save(therapist);

        return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist));
    }

    @Transactional
    public ResponseEntity<TherapistProto.Therapist> updateTherapist(
            TherapistProto.UpdateTherapistRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID therapistId = UUID.fromString(request.getId());
        Therapist therapist = therapistRepository.findById(therapistId)
                .orElseThrow(() -> new IllegalArgumentException("Therapist not found"));

        // Check if current user is the therapist or admin of the organisation
        boolean isTherapist = therapist.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = isOrganisationAdmin(currentUser.getId(), therapist.getOrganisation().getId());
        
        if (!isTherapist && !isAdmin) {
            throw new AccessDeniedException("Only the therapist or organisation admin can update therapist profile");
        }

        // Update fields using mapper
        TherapistRequestMapper.updateFromRequest(therapist, request);

        therapist = therapistRepository.save(therapist);

        return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist));
    }

    @Transactional
    public ResponseEntity<TherapistProto.DeleteTherapistResponse> deleteTherapist(
            TherapistProto.DeleteTherapistRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID therapistId = UUID.fromString(request.getId());
        Therapist therapist = therapistRepository.findById(therapistId)
                .orElseThrow(() -> new IllegalArgumentException("Therapist not found"));

        // Only organisation admin can delete
        if (!isOrganisationAdmin(currentUser.getId(), therapist.getOrganisation().getId())) {
            throw new AccessDeniedException("Only organisation administrators can delete therapists");
        }

        therapistRepository.delete(therapist);

        return ResponseEntity.ok(TherapistProto.DeleteTherapistResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Therapist deleted successfully")
                .build());
    }

    @Transactional
    public ResponseEntity<TherapistProto.Therapist> publishTherapist(
            TherapistProto.PublishTherapistRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID therapistId = UUID.fromString(request.getId());
        Therapist therapist = therapistRepository.findById(therapistId)
                .orElseThrow(() -> new IllegalArgumentException("Therapist not found"));

        // Check if current user is the therapist or admin of the organisation
        boolean isTherapist = therapist.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = isOrganisationAdmin(currentUser.getId(), therapist.getOrganisation().getId());
        
        if (!isTherapist && !isAdmin) {
            throw new AccessDeniedException("Only the therapist or organisation admin can publish therapist profile");
        }

        therapist.setPublishedAt(Instant.now());
        therapist = therapistRepository.save(therapist);

        return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist));
    }

    @Transactional
    public ResponseEntity<TherapistProto.Therapist> unpublishTherapist(
            TherapistProto.UnpublishTherapistRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID therapistId = UUID.fromString(request.getId());
        Therapist therapist = therapistRepository.findById(therapistId)
                .orElseThrow(() -> new IllegalArgumentException("Therapist not found"));

        // Check if current user is the therapist or admin of the organisation
        boolean isTherapist = therapist.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = isOrganisationAdmin(currentUser.getId(), therapist.getOrganisation().getId());
        
        if (!isTherapist && !isAdmin) {
            throw new AccessDeniedException("Only the therapist or organisation admin can unpublish therapist profile");
        }

        therapist.setPublishedAt(null);
        therapist = therapistRepository.save(therapist);

        return ResponseEntity.ok(TherapistProtoMapper.toProto(therapist));
    }

    private boolean isOrganisationAdmin(UUID userId, UUID organisationId) {
        Optional<OrganisationMember> membership = organisationMemberRepository
                .findByUserIdAndOrganisationId(userId, organisationId);
        return membership.isPresent() && 
               membership.get().getMemberType() == MemberType.ADMINISTRATOR;
    }
}