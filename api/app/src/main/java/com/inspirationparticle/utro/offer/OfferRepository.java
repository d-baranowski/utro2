package com.inspirationparticle.utro.offer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    
    /**
     * Find all offers belonging to a specific organisation
     */
    List<Offer> findByOrganisationId(UUID organisationId);
    
    /**
     * Find offers by organisation ID with pagination support
     */
    @Query("SELECT o FROM Offer o WHERE o.organisation.id = :organisationId ORDER BY o.createdAt DESC")
    List<Offer> findByOrganisationIdOrderByCreatedAtDesc(@Param("organisationId") UUID organisationId);
    
    /**
     * Find offers by name (case-insensitive search in both languages)
     */
    @Query("SELECT o FROM Offer o WHERE " +
           "LOWER(o.nameEng) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(o.namePl) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Offer> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find offers by description (case-insensitive search in both languages)
     */
    @Query("SELECT o FROM Offer o WHERE " +
           "LOWER(o.descriptionEng) LIKE LOWER(CONCAT('%', :description, '%')) OR " +
           "LOWER(o.descriptionPl) LIKE LOWER(CONCAT('%', :description, '%'))")
    List<Offer> findByDescriptionContainingIgnoreCase(@Param("description") String description);
    
    /**
     * Search offers by name or description in both languages
     */
    @Query("SELECT o FROM Offer o WHERE " +
           "LOWER(o.nameEng) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.namePl) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.descriptionEng) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.descriptionPl) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Offer> searchOffers(@Param("searchTerm") String searchTerm);
    
    /**
     * Find offers by organisation and search term
     */
    @Query("SELECT o FROM Offer o WHERE o.organisation.id = :organisationId AND (" +
           "LOWER(o.nameEng) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.namePl) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.descriptionEng) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.descriptionPl) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Offer> findByOrganisationIdAndSearchTerm(@Param("organisationId") UUID organisationId, 
                                                   @Param("searchTerm") String searchTerm);
    
    /**
     * Count offers by organisation
     */
    long countByOrganisationId(UUID organisationId);
    
    /**
     * Check if an offer exists with the given name in the organisation
     */
    @Query("SELECT COUNT(o) > 0 FROM Offer o WHERE o.organisation.id = :organisationId AND " +
           "(LOWER(o.nameEng) = LOWER(:nameEng) OR LOWER(o.namePl) = LOWER(:namePl))")
    boolean existsByOrganisationIdAndName(@Param("organisationId") UUID organisationId,
                                          @Param("nameEng") String nameEng,
                                          @Param("namePl") String namePl);
}