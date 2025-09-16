package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final InvitationRepository invitationRepository;
    private final OrganisationMemberRepository organisationMemberRepository;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;

    @Transactional
    public Invitation createInvitation(String email, UUID organisationId, MemberType memberType, User inviter) {
        // Check if user is already a member
        userRepository.findByEmail(email).ifPresent(user -> {
            if (organisationMemberRepository.findByUserIdAndOrganisationId(user.getId(), organisationId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a member of this organization");
            }
        });

        // Check for existing pending invitation
        invitationRepository.findActiveInvitation(email, organisationId).ifPresent(invitation -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An active invitation already exists for this email");
        });

        Organisation organisation = new Organisation();
        organisation.setId(organisationId);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(7, ChronoUnit.DAYS); // 7 days expiration

        Invitation invitation = Invitation.builder()
                .email(email)
                .organisation(organisation)
                .invitedBy(inviter)
                .memberType(memberType)
                .status(Invitation.InvitationStatus.PENDING)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        invitation = invitationRepository.save(invitation);
        // Email sending can be implemented later
        return invitation;
    }

    @Transactional
    public Invitation acceptInvitation(UUID invitationId, String email) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
                
        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation is not for you");
        }
        
        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This invitation is no longer valid");
        }
        
        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(Invitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This invitation has expired");
        }
        
        // Find or create the user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Add user to organization
        OrganisationMember member = new OrganisationMember();
        member.setUser(user);
        member.setOrganisation(invitation.getOrganisation());
        member.setMemberType(invitation.getMemberType());
                
        organisationMemberRepository.save(member);
        
        // Update invitation status
        invitation.setStatus(Invitation.InvitationStatus.ACCEPTED);
        return invitationRepository.save(invitation);
    }

    @Transactional
    public Invitation declineInvitation(UUID invitationId, String email) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
                
        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation is not for you");
        }
        
        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This invitation is no longer valid");
        }
        
        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(Invitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This invitation has expired");
        }

        invitation.setStatus(Invitation.InvitationStatus.DECLINED);
        return invitationRepository.save(invitation);
    }

    @Transactional
    public void cancelInvitation(UUID invitationId, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
                
        // Check if the user has permission to cancel this invitation
        boolean isAdmin = organisationMemberRepository
                .findByUserIdAndOrganisationId(
                        user.getId(), 
                        invitation.getOrganisation().getId())
                .map(member -> member.getMemberType() == MemberType.ADMINISTRATOR)
                .orElse(false);
                
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organization administrators can cancel invitations");
        }
        
        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending invitations can be cancelled");
        }
        
        invitation.setStatus(Invitation.InvitationStatus.DECLINED);
        invitationRepository.save(invitation);
    }

    public List<Invitation> getOrganizationInvitations(UUID organisationId) {
        return invitationRepository.findByOrganisationId(organisationId);
    }

    private void sendInvitationEmail(Invitation invitation) {
        // TODO: Implement email sending logic
        // Email functionality will be added in a future iteration
        Organisation org = organisationRepository.findById(invitation.getOrganisation().getId())
                .orElse(invitation.getOrganisation());
        System.out.println("Email would be sent to " + invitation.getEmail() + 
                          " for organization " + org.getName());
    }
}
