package com.inspirationparticle.utro.therapist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TherapistEducationRepository extends JpaRepository<TherapistEducation, UUID> {
    
    List<TherapistEducation> findByTherapistIdOrderByDisplayOrderAscGraduationYearDesc(UUID therapistId);
    
    List<TherapistEducation> findByTherapistIdAndIsCompletedTrueOrderByGraduationYearDesc(UUID therapistId);
}