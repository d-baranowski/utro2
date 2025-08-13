package com.inspirationparticle.utro.organisation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, OrganisationMemberId> {
    
    @Query("SELECT om FROM OrganisationMember om " +
           "JOIN FETCH om.organisation o " +
           "WHERE om.user.id = :userId " +
           "ORDER BY om.joinedAt DESC")
    List<OrganisationMember> findByUserIdWithOrganisation(@Param("userId") String userId);
    
    List<OrganisationMember> findByUserId(String userId);
    
    List<OrganisationMember> findByOrganisationId(String organisationId);

    OrganisationMember findByUserIdAndOrganisationId(String userId, String organisationId);
}