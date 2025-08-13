package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;
import com.inspirationparticle.utro.user.UserRepository;
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

    @Autowired
    private OrganisationService organisationService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/GetMyOrganisations")
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
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/CreateOrganisation")
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
    @PostMapping("/com.inspirationparticle.organisation.v1.OrganisationService/SearchOrganisations")
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
}