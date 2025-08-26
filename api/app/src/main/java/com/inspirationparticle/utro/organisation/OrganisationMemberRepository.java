package com.inspirationparticle.utro.organisation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, OrganisationMemberId> {
    
    @Query("SELECT om FROM OrganisationMember om " +
           "JOIN FETCH om.organisation o " +
           "WHERE om.user.id = :userId " +
           "ORDER BY om.joinedAt DESC")
    List<OrganisationMember> findByUserIdWithOrganisation(@Param("userId") UUID userId);
    
    List<OrganisationMember> findByUserId(UUID userId);
    
    List<OrganisationMember> findByOrganisationId(UUID organisationId);

    Optional<OrganisationMember> findByUserIdAndOrganisationId(UUID userId, UUID organisationId);
    
    @Query("SELECT om FROM OrganisationMember om " +
           "JOIN FETCH om.user u " +
           "WHERE om.organisation.id = :organisationId " +
           "ORDER BY u.fullName, u.username")
    List<OrganisationMember> findByOrganisationIdWithUser(@Param("organisationId") UUID organisationId);
}