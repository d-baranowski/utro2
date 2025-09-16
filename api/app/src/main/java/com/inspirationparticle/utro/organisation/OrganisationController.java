package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.inspirationparticle.utro.gen.organisation.v1.InvitationOuterClass;
import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class OrganisationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganisationMemberRepository organisationMemberRepository;

    @Autowired
    private OrganisationRepository organisationRepository;
    
    @Autowired
    private OrganisationService organisationService;
    
    @Autowired
    private InvitationService invitationService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.InvitationService/CreateInvitation",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<InvitationOuterClass.CreateInvitationResponse> createInvitation(
            @RequestBody InvitationOuterClass.CreateInvitationRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User inviter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
                
        MemberType memberType = request.getMemberType() == OrganisationOuterClass.MemberType.MEMBER_TYPE_ADMINISTRATOR 
                ? MemberType.ADMINISTRATOR 
                : MemberType.MEMBER;
                
        Invitation invitation = invitationService.createInvitation(
                request.getEmail(),
                UUID.fromString(request.getOrganisationId()),
                memberType,
                inviter
        );
        
        InvitationOuterClass.Invitation invitationProto = InvitationMapper.toProto(invitation);
        return ResponseEntity.ok(InvitationOuterClass.CreateInvitationResponse.newBuilder()
                .setInvitation(invitationProto)
                .build());
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.InvitationService/GetInvitations",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<InvitationOuterClass.GetInvitationsResponse> getInvitations(
            @RequestBody InvitationOuterClass.GetInvitationsRequest request) {
                
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Verify user has access to this organization
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
                
        boolean hasAccess = organisationMemberRepository
                .findByUserIdAndOrganisationId(
                        user.getId(), 
                        UUID.fromString(request.getOrganisationId()))
                .isPresent();
                
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No access to this organization");
        }
        
        List<Invitation> invitations = invitationService.getOrganizationInvitations(
                UUID.fromString(request.getOrganisationId()));
                
        List<InvitationOuterClass.Invitation> invitationProtos = invitations.stream()
                .map(InvitationMapper::toProto)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(InvitationOuterClass.GetInvitationsResponse.newBuilder()
                .addAllInvitations(invitationProtos)
                .build());
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.InvitationService/RespondToInvitation",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<InvitationOuterClass.RespondToInvitationResponse> respondToInvitation(
            @RequestBody InvitationOuterClass.RespondToInvitationRequest request) {
                
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
                
        Invitation invitation;
        if (request.getAccept()) {
            invitation = invitationService.acceptInvitation(
                    UUID.fromString(request.getInvitationId()),
                    user.getEmail()
            );
        } else {
            invitation = invitationService.declineInvitation(
                    UUID.fromString(request.getInvitationId()),
                    user.getEmail()
            );
        }
        
        return ResponseEntity.ok(InvitationOuterClass.RespondToInvitationResponse.newBuilder()
                .setInvitation(InvitationMapper.toProto(invitation))
                .build());
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.InvitationService/CancelInvitation",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<InvitationOuterClass.CancelInvitationResponse> cancelInvitation(
            @RequestBody InvitationOuterClass.CancelInvitationRequest request) {
                
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
                
        invitationService.cancelInvitation(
                UUID.fromString(request.getInvitationId()),
                user
        );
        
        return ResponseEntity.ok(InvitationOuterClass.CancelInvitationResponse.newBuilder()
                .setSuccess(true)
                .build());
    }
    
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/GetMyOrganisations",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OrganisationOuterClass.GetMyOrganisationsResponse> getMyOrganisations(@RequestBody OrganisationOuterClass.GetMyOrganisationsRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(OrganisationOuterClass.GetMyOrganisationsResponse.newBuilder().build());
        }

        User user = userOpt.get();

        List<OrganisationMember> memberships = organisationMemberRepository.findByUserIdWithOrganisation(user.getId());
        List<OrganisationOuterClass.Organisation> organisations = memberships.stream().map(m -> {
            return OrganisationMapper.protoFromEntity(m.getOrganisation(), m.getMemberType());
        }).toList();

        return ResponseEntity.ok(OrganisationOuterClass.GetMyOrganisationsResponse.newBuilder().addAllOrganisations(organisations).build());
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/CreateOrganisation",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OrganisationOuterClass.CreateOrganisationResponse> createOrganisation(@RequestBody OrganisationOuterClass.CreateOrganisationRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOpt.get();
        Organisation orgEntity = OrganisationMapper.entityFromCreateRequest(request);
        orgEntity = organisationService.createOrganisation(orgEntity, user);

        // Convert to protobuf response
        OrganisationOuterClass.Organisation org = OrganisationMapper.protoFromEntity(orgEntity, MemberType.ADMINISTRATOR);
        OrganisationOuterClass.CreateOrganisationResponse response = OrganisationOuterClass.CreateOrganisationResponse.newBuilder()
                .setOrganisation(org)
                .build();

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/SearchOrganisations",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OrganisationOuterClass.SearchOrganisationsResponse> searchOrganisations(@RequestBody OrganisationOuterClass.SearchOrganisationsRequest request) {
        List<Organisation> entities = organisationRepository.searchByNameOrDescription(request.getQuery());

        List<OrganisationOuterClass.Organisation> organisations = entities.stream()
                .map(orgEntity -> OrganisationMapper.protoFromEntity(orgEntity, null))
                .collect(Collectors.toList());

        OrganisationOuterClass.SearchOrganisationsResponse response = OrganisationOuterClass.SearchOrganisationsResponse.newBuilder()
                .addAllOrganisations(organisations)
                .build();

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/GetOrganisationUsers",
                 consumes = "application/json", 
                 produces = "application/json")
    public ResponseEntity<OrganisationOuterClass.GetOrganisationUsersResponse> getOrganisationUsers(@RequestBody OrganisationOuterClass.GetOrganisationUsersRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOpt.get();
        
        // Parse organisation ID
        UUID organisationId;
        try {
            organisationId = UUID.fromString(request.getOrganisationId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        // Check if user is member of the requested organisation
        Optional<OrganisationMember> membershipOpt = organisationMemberRepository
            .findByUserIdAndOrganisationId(user.getId(), organisationId);
        if (membershipOpt.isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        // Only allow admins to see all users
        OrganisationMember membership = membershipOpt.get();
        if (membership.getMemberType() != MemberType.ADMINISTRATOR) {
            return ResponseEntity.status(403).build();
        }

        // Get all users in the organisation
        List<OrganisationMember> allMembers = organisationMemberRepository
            .findByOrganisationIdWithUser(organisationId);
        
        List<OrganisationOuterClass.User> users = allMembers.stream()
            .map(member -> OrganisationMapper.userProtoFromMember(member))
            .collect(Collectors.toList());

        OrganisationOuterClass.GetOrganisationUsersResponse response = 
            OrganisationOuterClass.GetOrganisationUsersResponse.newBuilder()
                .addAllUsers(users)
                .build();

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/RemoveOrganisationMember",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OrganisationOuterClass.RemoveOrganisationMemberResponse> removeOrganisationMember(@RequestBody OrganisationOuterClass.RemoveOrganisationMemberRequest request) {
        // Get the authenticated user's username from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOpt.get();
        
        // Parse UUIDs
        UUID organisationId;
        UUID userIdToRemove;
        try {
            organisationId = UUID.fromString(request.getOrganisationId());
            userIdToRemove = UUID.fromString(request.getUserId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        // Check if requesting user is admin of the organisation
        Optional<OrganisationMember> requestingUserMembership = organisationMemberRepository
            .findByUserIdAndOrganisationId(user.getId(), organisationId);
        if (requestingUserMembership.isEmpty() || 
            requestingUserMembership.get().getMemberType() != MemberType.ADMINISTRATOR) {
            return ResponseEntity.status(403).build();
        }

        // Cannot remove yourself
        if (user.getId().equals(userIdToRemove)) {
            return ResponseEntity.status(400).build();
        }

        // Check if the member to remove exists in the organisation
        Optional<OrganisationMember> memberToRemove = organisationMemberRepository
            .findByUserIdAndOrganisationId(userIdToRemove, organisationId);
        if (memberToRemove.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        // Remove the member
        organisationMemberRepository.delete(memberToRemove.get());

        OrganisationOuterClass.RemoveOrganisationMemberResponse response = 
            OrganisationOuterClass.RemoveOrganisationMemberResponse.newBuilder()
                .setSuccess(true)
                .build();

        return ResponseEntity.ok(response);
    }
}