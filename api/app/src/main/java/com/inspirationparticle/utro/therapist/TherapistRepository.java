package com.inspirationparticle.utro.therapist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TherapistRepository extends JpaRepository<Therapist, UUID> {
    
    Optional<Therapist> findByUserId(UUID userId);
    
    Optional<Therapist> findBySlug(String slug);
    
    List<Therapist> findByOrganisationIdAndIsActiveTrue(UUID organisationId);
    
    List<Therapist> findByIsActiveTrueAndIsAcceptingNewClientsTrue();
    
    List<Therapist> findByVisibilityAndIsActiveTrue(Therapist.TherapistVisibility visibility);
    
    @Query("SELECT t FROM Therapist t WHERE t.isActive = true AND " +
           "(t.visibility = 'PUBLIC' OR " +
           "(t.visibility = 'ORGANISATION_ONLY' AND t.organisation.id = :organisationId))")
    List<Therapist> findVisibleTherapists(@Param("organisationId") UUID organisationId);
    
    @Query("SELECT t FROM Therapist t WHERE t.isActive = true AND (" +
           "LOWER(t.descriptionEng) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.descriptionPl) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.professionalTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Therapist> searchTherapists(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT t FROM Therapist t " +
           "JOIN t.specializations ts " +
           "WHERE t.isActive = true AND ts.specialization.id = :specializationId")
    List<Therapist> findBySpecializationId(@Param("specializationId") UUID specializationId);
    
    @Query("SELECT t FROM Therapist t WHERE t.isActive = true AND " +
           "(:inPerson = false OR t.inPersonTherapyFormat = true) AND " +
           "(:online = false OR t.onlineTherapyFormat = true)")
    List<Therapist> findByTherapyFormats(@Param("inPerson") Boolean inPerson, @Param("online") Boolean online);
    
    @Query("SELECT t FROM Therapist t WHERE t.isActive = true AND " +
           "EXISTS (SELECT 1 FROM t.languages l WHERE LOWER(l) = LOWER(:language))")
    List<Therapist> findByLanguage(@Param("language") String language);
    
    boolean existsBySlug(String slug);
    
    boolean existsByUserIdAndIdNot(UUID userId, UUID id);
}