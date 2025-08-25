package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.util.UUIDv7Generator;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "therapist_certification")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapistCertification {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapist_id", nullable = false)
    private Therapist therapist;

    @Column(name = "name", nullable = false, length = 500)
    private String name;

    @Column(name = "issuing_organization", nullable = false, length = 500)
    private String issuingOrganization;

    @Column(name = "credential_id")
    private String credentialId;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "verification_url", length = 500)
    private String verificationUrl;

    @Column(name = "certification_level", length = 100)
    private String certificationLevel;

    @Column(name = "hours_completed")
    private Integer hoursCompleted;

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