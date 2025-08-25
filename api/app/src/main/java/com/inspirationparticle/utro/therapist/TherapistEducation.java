package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.util.UUIDv7Generator;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "therapist_education")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapistEducation {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapist_id", nullable = false)
    private Therapist therapist;

    @Column(name = "degree", nullable = false)
    private String degree;

    @Column(name = "field_of_study")
    private String fieldOfStudy;

    @Column(name = "institution", nullable = false, length = 500)
    private String institution;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "is_completed")
    private Boolean isCompleted = true;

    @Column(name = "thesis_title", columnDefinition = "TEXT")
    private String thesisTitle;

    @Column(name = "honors", columnDefinition = "TEXT")
    private String honors;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUIDv7Generator.generateUUIDv7();
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}