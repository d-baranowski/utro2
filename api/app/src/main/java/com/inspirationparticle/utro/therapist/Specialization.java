package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.util.UUIDv7Generator;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "specialization")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Specialization {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "name_eng", nullable = false, unique = true)
    private String nameEng;

    @Column(name = "name_pl", nullable = false, unique = true)
    private String namePl;

    @Column(name = "description_eng", columnDefinition = "TEXT")
    private String descriptionEng;

    @Column(name = "description_pl", columnDefinition = "TEXT")
    private String descriptionPl;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "specialization", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TherapistSpecialization> therapistSpecializations = new HashSet<>();

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