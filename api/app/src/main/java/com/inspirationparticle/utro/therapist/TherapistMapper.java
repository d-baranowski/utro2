package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.therapist.dto.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

public class TherapistMapper {

    private TherapistMapper() {
    }

    public static TherapistDto toDto(Therapist therapist) {
        if (therapist == null) {
            return null;
        }

        TherapistDto dto = new TherapistDto();
        dto.setId(therapist.getId());
        dto.setUserId(therapist.getUser().getId());
        dto.setUserName(therapist.getUser().getUsername());
        dto.setUserFullName(therapist.getUser().getFullName());
        dto.setOrganisationId(therapist.getOrganisation().getId());
        dto.setOrganisationName(therapist.getOrganisation().getName());
        dto.setProfessionalTitle(therapist.getProfessionalTitle());
        dto.setDescriptionEng(therapist.getDescriptionEng());
        dto.setDescriptionPl(therapist.getDescriptionPl());
        dto.setWorkExperienceEng(therapist.getWorkExperienceEng());
        dto.setWorkExperiencePl(therapist.getWorkExperiencePl());
        dto.setLanguages(therapist.getLanguages());
        dto.setInPersonTherapyFormat(therapist.getInPersonTherapyFormat());
        dto.setOnlineTherapyFormat(therapist.getOnlineTherapyFormat());
        dto.setProfileImageMimeType(therapist.getProfileImageMimeType());
        dto.setContactEmail(therapist.getContactEmail());
        dto.setContactPhone(therapist.getContactPhone());
        dto.setWebsiteUrl(therapist.getWebsiteUrl());
        dto.setIsActive(therapist.getIsActive());
        dto.setIsAcceptingNewClients(therapist.getIsAcceptingNewClients());
        dto.setVisibility(therapist.getVisibility());
        dto.setSlug(therapist.getSlug());
        dto.setMetaDescription(therapist.getMetaDescription());
        dto.setSearchTags(therapist.getSearchTags());
        dto.setCreatedAt(therapist.getCreatedAt());
        dto.setUpdatedAt(therapist.getUpdatedAt());
        dto.setPublishedAt(therapist.getPublishedAt());

        // Map related entities
        if (therapist.getSpecializations() != null) {
            dto.setSpecializations(therapist.getSpecializations().stream()
                    .map(TherapistMapper::toSpecializationDto)
                    .collect(Collectors.toSet()));
        }

        if (therapist.getEducation() != null) {
            dto.setEducation(therapist.getEducation().stream()
                    .map(TherapistMapper::toEducationDto)
                    .collect(Collectors.toSet()));
        }

        if (therapist.getCertifications() != null) {
            dto.setCertifications(therapist.getCertifications().stream()
                    .map(TherapistMapper::toCertificationDto)
                    .collect(Collectors.toSet()));
        }

        return dto;
    }

    public static TherapistSpecializationDto toSpecializationDto(TherapistSpecialization ts) {
        if (ts == null) {
            return null;
        }

        TherapistSpecializationDto dto = new TherapistSpecializationDto();
        dto.setSpecializationId(ts.getSpecialization().getId());
        dto.setNameEng(ts.getSpecialization().getNameEng());
        dto.setNamePl(ts.getSpecialization().getNamePl());
        dto.setDescriptionEng(ts.getSpecialization().getDescriptionEng());
        dto.setDescriptionPl(ts.getSpecialization().getDescriptionPl());
        dto.setCategory(ts.getSpecialization().getCategory());
        dto.setIsPrimary(ts.getIsPrimary());
        dto.setYearsOfPractice(ts.getYearsOfPractice());
        dto.setCreatedAt(ts.getCreatedAt());
        return dto;
    }

    public static TherapistEducationDto toEducationDto(TherapistEducation education) {
        if (education == null) {
            return null;
        }

        TherapistEducationDto dto = new TherapistEducationDto();
        dto.setId(education.getId());
        dto.setDegree(education.getDegree());
        dto.setFieldOfStudy(education.getFieldOfStudy());
        dto.setInstitution(education.getInstitution());
        dto.setCountry(education.getCountry());
        dto.setStartYear(education.getStartYear());
        dto.setGraduationYear(education.getGraduationYear());
        dto.setIsCompleted(education.getIsCompleted());
        dto.setThesisTitle(education.getThesisTitle());
        dto.setHonors(education.getHonors());
        dto.setDisplayOrder(education.getDisplayOrder());
        dto.setCreatedAt(education.getCreatedAt());
        dto.setUpdatedAt(education.getUpdatedAt());
        return dto;
    }

    public static TherapistCertificationDto toCertificationDto(TherapistCertification certification) {
        if (certification == null) {
            return null;
        }

        TherapistCertificationDto dto = new TherapistCertificationDto();
        dto.setId(certification.getId());
        dto.setName(certification.getName());
        dto.setIssuingOrganization(certification.getIssuingOrganization());
        dto.setCredentialId(certification.getCredentialId());
        dto.setIssueDate(certification.getIssueDate());
        dto.setExpiryDate(certification.getExpiryDate());
        dto.setIsActive(certification.getIsActive());
        dto.setVerificationUrl(certification.getVerificationUrl());
        dto.setCertificationLevel(certification.getCertificationLevel());
        dto.setHoursCompleted(certification.getHoursCompleted());
        dto.setDisplayOrder(certification.getDisplayOrder());
        dto.setCreatedAt(certification.getCreatedAt());
        dto.setUpdatedAt(certification.getUpdatedAt());
        return dto;
    }

    public static SpecializationDto toSpecializationDto(Specialization specialization) {
        if (specialization == null) {
            return null;
        }

        SpecializationDto dto = new SpecializationDto();
        dto.setId(specialization.getId());
        dto.setNameEng(specialization.getNameEng());
        dto.setNamePl(specialization.getNamePl());
        dto.setDescriptionEng(specialization.getDescriptionEng());
        dto.setDescriptionPl(specialization.getDescriptionPl());
        dto.setCategory(specialization.getCategory());
        dto.setIsActive(specialization.getIsActive());
        dto.setCreatedAt(specialization.getCreatedAt());
        dto.setUpdatedAt(specialization.getUpdatedAt());
        return dto;
    }

    public static com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility mapVisibilityFromProto(com.inspirationparticle.utro.gen.v1.TherapistProto.TherapistVisibility visibility) {
        return switch (visibility) {
            case THERAPIST_VISIBILITY_PUBLIC -> com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility.PUBLIC;
            case THERAPIST_VISIBILITY_ORGANISATION_ONLY -> com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility.ORGANISATION_ONLY;
            case THERAPIST_VISIBILITY_PRIVATE -> com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility.PRIVATE;
            default -> com.inspirationparticle.utro.therapist.Therapist.TherapistVisibility.PUBLIC;
        };
    }
}