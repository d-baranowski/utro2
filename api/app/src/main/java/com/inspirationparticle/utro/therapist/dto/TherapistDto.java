package com.inspirationparticle.utro.therapist.dto;

import com.inspirationparticle.utro.therapist.Therapist;
import lombok.Data;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
public class TherapistDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userFullName;
    private UUID organisationId;
    private String organisationName;
    private String professionalTitle;
    private String descriptionEng;
    private String descriptionPl;
    private String workExperienceEng;
    private String workExperiencePl;
    private Set<String> languages;
    private Boolean inPersonTherapyFormat;
    private Boolean onlineTherapyFormat;
    private String profileImageMimeType;
    private String contactEmail;
    private String contactPhone;
    private String websiteUrl;
    private Boolean isActive;
    private Boolean isAcceptingNewClients;
    private Therapist.TherapistVisibility visibility;
    private String slug;
    private String metaDescription;
    private Set<String> searchTags;
    private Set<TherapistSpecializationDto> specializations;
    private Set<TherapistEducationDto> education;
    private Set<TherapistCertificationDto> certifications;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;
}