package com.inspirationparticle.utro.therapist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TherapistCertificationRepository extends JpaRepository<TherapistCertification, UUID> {
    
    List<TherapistCertification> findByTherapistIdOrderByDisplayOrderAscIssueDateDesc(UUID therapistId);
    
    List<TherapistCertification> findByTherapistIdAndIsActiveTrueOrderByIssueDateDesc(UUID therapistId);
    
    @Query("SELECT tc FROM TherapistCertification tc WHERE tc.therapist.id = :therapistId " +
           "AND tc.isActive = true AND (tc.expiryDate IS NULL OR tc.expiryDate > :currentDate)")
    List<TherapistCertification> findValidCertifications(@Param("therapistId") UUID therapistId, 
                                                        @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT tc FROM TherapistCertification tc WHERE tc.isActive = true " +
           "AND tc.expiryDate IS NOT NULL AND tc.expiryDate BETWEEN :startDate AND :endDate")
    List<TherapistCertification> findCertificationsExpiringBetween(@Param("startDate") LocalDate startDate, 
                                                                  @Param("endDate") LocalDate endDate);
}