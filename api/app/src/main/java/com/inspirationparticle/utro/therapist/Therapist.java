package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.util.UUIDv7Generator;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "therapist")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Therapist {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;

    @Column(name = "professional_title")
    private String professionalTitle;

    @Column(name = "description_eng", columnDefinition = "TEXT")
    private String descriptionEng;

    @Column(name = "description_pl", columnDefinition = "TEXT")
    private String descriptionPl;

    @Column(name = "work_experience_eng", columnDefinition = "TEXT")
    private String workExperienceEng;

    @Column(name = "work_experience_pl", columnDefinition = "TEXT")
    private String workExperiencePl;

    @ElementCollection
    @CollectionTable(name = "therapist_languages", joinColumns = @JoinColumn(name = "therapist_id"))
    @Column(name = "language")
    private Set<String> languages = new HashSet<>();

    @Column(name = "in_person_therapy_format")
    private Boolean inPersonTherapyFormat = false;

    @Column(name = "online_therapy_format")
    private Boolean onlineTherapyFormat = false;

    @Column(name = "profile_image", columnDefinition = "bytea")
    private byte[] profileImage;

    @Column(name = "profile_image_mime_type")
    private String profileImageMimeType;

    @Email
    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_accepting_new_clients")
    private Boolean isAcceptingNewClients = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    private TherapistVisibility visibility = TherapistVisibility.PUBLIC;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @ElementCollection
    @CollectionTable(name = "therapist_search_tags", joinColumns = @JoinColumn(name = "therapist_id"))
    @Column(name = "tag")
    private Set<String> searchTags = new HashSet<>();

    @OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TherapistSpecialization> specializations = new HashSet<>();

    @OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TherapistEducation> education = new HashSet<>();

    @OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TherapistCertification> certifications = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

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

    public enum TherapistVisibility {
        PUBLIC,
        ORGANISATION_ONLY,
        PRIVATE
    }
}