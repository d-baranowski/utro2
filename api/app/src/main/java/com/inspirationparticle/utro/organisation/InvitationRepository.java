package com.inspirationparticle.utro.organisation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    
    @Query("SELECT i FROM Invitation i " +
           "WHERE i.email = :email " +
           "AND i.organisation.id = :organisationId " +
           "AND i.status = 'PENDING' " +
           "AND i.expiresAt > CURRENT_TIMESTAMP")
    Optional<Invitation> findActiveInvitation(
        @Param("email") String email,
        @Param("organisationId") UUID organisationId
    );
    
    @Query("SELECT i FROM Invitation i " +
           "WHERE i.email = :email " +
           "AND i.status = 'PENDING' " +
           "AND i.expiresAt > CURRENT_TIMESTAMP")
    List<Invitation> findPendingInvitationsByEmail(@Param("email") String email);
    
    @Query("SELECT i FROM Invitation i " +
           "WHERE i.organisation.id = :organisationId " +
           "ORDER BY i.createdAt DESC")
    List<Invitation> findByOrganisationId(@Param("organisationId") UUID organisationId);
    
    @Query("SELECT i FROM Invitation i " +
           "WHERE i.id = :id " +
           "AND i.email = :email " +
           "AND i.status = 'PENDING' " +
           "AND i.expiresAt > CURRENT_TIMESTAMP")
    Optional<Invitation> findValidInvitation(
        @Param("id") UUID id,
        @Param("email") String email
    );
}
