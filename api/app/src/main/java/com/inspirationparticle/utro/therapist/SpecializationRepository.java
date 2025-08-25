package com.inspirationparticle.utro.therapist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, UUID> {
    
    List<Specialization> findByIsActiveTrueOrderByNameEng();
    
    List<Specialization> findByCategoryAndIsActiveTrueOrderByNameEng(String category);
    
    @Query("SELECT DISTINCT s.category FROM Specialization s WHERE s.isActive = true ORDER BY s.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT s FROM Specialization s WHERE s.isActive = true AND " +
           "(LOWER(s.nameEng) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.namePl) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Specialization> searchSpecializations(@Param("query") String query);
    
    boolean existsByNameEngIgnoreCase(String nameEng);
    
    boolean existsByNamePlIgnoreCase(String namePl);
}