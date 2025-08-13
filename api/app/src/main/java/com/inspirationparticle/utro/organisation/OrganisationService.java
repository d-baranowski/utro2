package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import lombok.AllArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@AllArgsConstructor
public class OrganisationService {
    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository organisationMemberRepository;

    @Transactional
    public Organisation createOrganisation(@Validated Organisation org, User createdBy) {
        // Check if organisation name already exists
        if (organisationRepository.existsByName(org.getName())) {
            throw new OrganisationExistsException("Organisation with " + org.getName() + " already exists");
        }
        // Create new organisation
        org = organisationRepository.save(org);

        // Create membership with ADMINISTRATOR role for the creator
        OrganisationMember membership = new OrganisationMember();
        membership.setUser(createdBy);
        membership.setOrganisation(org);
        membership.setMemberType(MemberType.ADMINISTRATOR);
        organisationMemberRepository.save(membership);

        return org;
    }
}
