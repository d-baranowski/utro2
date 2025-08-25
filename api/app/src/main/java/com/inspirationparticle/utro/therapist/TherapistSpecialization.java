package com.inspirationparticle.utro.therapist;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Setter
@Getter
@Entity
@Table(name = "therapist_specialization")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapistSpecialization {
    @EmbeddedId
    private TherapistSpecializationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("therapistId")
    @JoinColumn(name = "therapist_id", nullable = false)
    private Therapist therapist;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("specializationId")
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "years_of_practice")
    private Integer yearsOfPractice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}