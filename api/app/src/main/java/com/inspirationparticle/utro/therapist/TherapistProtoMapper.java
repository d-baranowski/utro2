package com.inspirationparticle.utro.therapist;

import com.google.protobuf.Timestamp;
import com.inspirationparticle.utro.gen.v1.TherapistProto.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Component
public class TherapistProtoMapper {

    public com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist toProto(com.inspirationparticle.utro.therapist.Therapist therapist) {
        if (therapist == null) {
            return null;
        }

        com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist.Builder builder = com.inspirationparticle.utro.gen.v1.TherapistProto.Therapist.newBuilder()
            .setId(therapist.getId().toString())
            .setUserId(therapist.getUser().getId().toString())
            .setUserName(therapist.getUser().getUsername())
            .setOrganisationId(therapist.getOrganisation().getId().toString())
            .setOrganisationName(therapist.getOrganisation().getName())
            .setInPersonTherapyFormat(therapist.getInPersonTherapyFormat() != null ? therapist.getInPersonTherapyFormat() : false)
            .setOnlineTherapyFormat(therapist.getOnlineTherapyFormat() != null ? therapist.getOnlineTherapyFormat() : false)
            .setIsActive(therapist.getIsActive() != null ? therapist.getIsActive() : false)
            .setIsAcceptingNewClients(therapist.getIsAcceptingNewClients() != null ? therapist.getIsAcceptingNewClients() : false)
            .setVisibility(mapVisibilityToProto(therapist.getVisibility()))
            .setCreatedAt(toTimestamp(therapist.getCreatedAt()))
            .setUpdatedAt(toTimestamp(therapist.getUpdatedAt()));

        // Optional string fields
        if (therapist.getUser().getFullName() != null) {
            builder.setUserFullName(therapist.getUser().getFullName());
        }
        if (therapist.getProfessionalTitle() != null) {
            builder.setProfessionalTitle(therapist.getProfessionalTitle());
        }
        if (therapist.getDescriptionEng() != null) {
            builder.setDescriptionEng(therapist.getDescriptionEng());
        }
        if (therapist.getDescriptionPl() != null) {
            builder.setDescriptionPl(therapist.getDescriptionPl());
        }
        if (therapist.getWorkExperienceEng() != null) {
            builder.setWorkExperienceEng(therapist.getWorkExperienceEng());
        }
        if (therapist.getWorkExperiencePl() != null) {
            builder.setWorkExperiencePl(therapist.getWorkExperiencePl());
        }
        if (therapist.getProfileImageMimeType() != null) {
            builder.setProfileImageMimeType(therapist.getProfileImageMimeType());
        }
        if (therapist.getContactEmail() != null) {
            builder.setContactEmail(therapist.getContactEmail());
        }
        if (therapist.getContactPhone() != null) {
            builder.setContactPhone(therapist.getContactPhone());
        }
        if (therapist.getWebsiteUrl() != null) {
            builder.setWebsiteUrl(therapist.getWebsiteUrl());
        }
        if (therapist.getSlug() != null) {
            builder.setSlug(therapist.getSlug());
        }
        if (therapist.getMetaDescription() != null) {
            builder.setMetaDescription(therapist.getMetaDescription());
        }
        if (therapist.getPublishedAt() != null) {
            builder.setPublishedAt(toTimestamp(therapist.getPublishedAt()));
        }

        // Collections
        if (therapist.getLanguages() != null) {
            builder.addAllLanguages(therapist.getLanguages());
        }
        if (therapist.getSearchTags() != null) {
            builder.addAllSearchTags(therapist.getSearchTags());
        }

        // Related entities
        if (therapist.getSpecializations() != null) {
            builder.addAllSpecializations(
                therapist.getSpecializations().stream()
                    .map(this::toProto)
                    .collect(Collectors.toList())
            );
        }

        if (therapist.getEducation() != null) {
            builder.addAllEducation(
                therapist.getEducation().stream()
                    .map(this::toProto)
                    .collect(Collectors.toList())
            );
        }

        if (therapist.getCertifications() != null) {
            builder.addAllCertifications(
                therapist.getCertifications().stream()
                    .map(this::toProto)
                    .collect(Collectors.toList())
            );
        }

        return builder.build();
    }

    public com.inspirationparticle.utro.gen.v1.TherapistProto.Specialization toProto(com.inspirationparticle.utro.therapist.Specialization specialization) {
        if (specialization == null) {
            return null;
        }

        com.inspirationparticle.utro.gen.v1.TherapistProto.Specialization.Builder builder = com.inspirationparticle.utro.gen.v1.TherapistProto.Specialization.newBuilder()
            .setId(specialization.getId().toString())
            .setNameEng(specialization.getNameEng())
            .setNamePl(specialization.getNamePl())
            .setIsActive(specialization.getIsActive() != null ? specialization.getIsActive() : false)
            .setCreatedAt(toTimestamp(specialization.getCreatedAt()))
            .setUpdatedAt(toTimestamp(specialization.getUpdatedAt()));

        if (specialization.getDescriptionEng() != null) {
            builder.setDescriptionEng(specialization.getDescriptionEng());
        }
        if (specialization.getDescriptionPl() != null) {
            builder.setDescriptionPl(specialization.getDescriptionPl());
        }
        if (specialization.getCategory() != null) {
            builder.setCategory(specialization.getCategory());
        }

        return builder.build();
    }

    public com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistSpecialization toProto(com.inspirationparticle.utro.therapist.TherapistSpecialization ts) {
        if (ts == null) {
            return null;
        }

        com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistSpecialization.Builder builder = com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistSpecialization.newBuilder()
            .setSpecializationId(ts.getSpecialization().getId().toString())
            .setNameEng(ts.getSpecialization().getNameEng())
            .setNamePl(ts.getSpecialization().getNamePl())
            .setIsPrimary(ts.getIsPrimary() != null ? ts.getIsPrimary() : false)
            .setCreatedAt(toTimestamp(ts.getCreatedAt()));

        if (ts.getSpecialization().getDescriptionEng() != null) {
            builder.setDescriptionEng(ts.getSpecialization().getDescriptionEng());
        }
        if (ts.getSpecialization().getDescriptionPl() != null) {
            builder.setDescriptionPl(ts.getSpecialization().getDescriptionPl());
        }
        if (ts.getSpecialization().getCategory() != null) {
            builder.setCategory(ts.getSpecialization().getCategory());
        }
        if (ts.getYearsOfPractice() != null) {
            builder.setYearsOfPractice(ts.getYearsOfPractice());
        }

        return builder.build();
    }

    public com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistEducation toProto(com.inspirationparticle.utro.therapist.TherapistEducation education) {
        if (education == null) {
            return null;
        }

        com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistEducation.Builder builder = com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistEducation.newBuilder()
            .setId(education.getId().toString())
            .setDegree(education.getDegree())
            .setInstitution(education.getInstitution())
            .setIsCompleted(education.getIsCompleted() != null ? education.getIsCompleted() : false)
            .setDisplayOrder(education.getDisplayOrder() != null ? education.getDisplayOrder() : 0)
            .setCreatedAt(toTimestamp(education.getCreatedAt()))
            .setUpdatedAt(toTimestamp(education.getUpdatedAt()));

        if (education.getFieldOfStudy() != null) {
            builder.setFieldOfStudy(education.getFieldOfStudy());
        }
        if (education.getCountry() != null) {
            builder.setCountry(education.getCountry());
        }
        if (education.getStartYear() != null) {
            builder.setStartYear(education.getStartYear());
        }
        if (education.getGraduationYear() != null) {
            builder.setGraduationYear(education.getGraduationYear());
        }
        if (education.getThesisTitle() != null) {
            builder.setThesisTitle(education.getThesisTitle());
        }
        if (education.getHonors() != null) {
            builder.setHonors(education.getHonors());
        }

        return builder.build();
    }

    public com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistCertification toProto(com.inspirationparticle.utro.therapist.TherapistCertification certification) {
        if (certification == null) {
            return null;
        }

        com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistCertification.Builder builder = com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistCertification.newBuilder()
            .setId(certification.getId().toString())
            .setName(certification.getName())
            .setIssuingOrganization(certification.getIssuingOrganization())
            .setIsActive(certification.getIsActive() != null ? certification.getIsActive() : false)
            .setDisplayOrder(certification.getDisplayOrder() != null ? certification.getDisplayOrder() : 0)
            .setCreatedAt(toTimestamp(certification.getCreatedAt()))
            .setUpdatedAt(toTimestamp(certification.getUpdatedAt()));

        if (certification.getCredentialId() != null) {
            builder.setCredentialId(certification.getCredentialId());
        }
        if (certification.getIssueDate() != null) {
            builder.setIssueDate(certification.getIssueDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
        if (certification.getExpiryDate() != null) {
            builder.setExpiryDate(certification.getExpiryDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
        if (certification.getVerificationUrl() != null) {
            builder.setVerificationUrl(certification.getVerificationUrl());
        }
        if (certification.getCertificationLevel() != null) {
            builder.setCertificationLevel(certification.getCertificationLevel());
        }
        if (certification.getHoursCompleted() != null) {
            builder.setHoursCompleted(certification.getHoursCompleted());
        }

        return builder.build();
    }

    private com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility mapVisibilityToProto(com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility visibility) {
        if (visibility == null) {
            return com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC;
        }
        
        return switch (visibility) {
            case PUBLIC -> com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC;
            case ORGANISATION_ONLY -> com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_ORGANISATION_ONLY;
            case PRIVATE -> com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PRIVATE;
        };
    }

    private Timestamp toTimestamp(Instant instant) {
        if (instant == null) {
            return null;
        }
        return Timestamp.newBuilder()
            .setSeconds(instant.getEpochSecond())
            .setNanos(instant.getNano())
            .build();
    }
}