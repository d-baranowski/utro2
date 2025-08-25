package com.inspirationparticle.utro.organisation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganisationRepository extends JpaRepository<Organisation, UUID> {
    
    @Query("SELECT o FROM Organisation o WHERE " +
           "LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY o.name")
    List<Organisation> searchByNameOrDescription(@Param("query") String query);
    
    boolean existsByName(String name);
}