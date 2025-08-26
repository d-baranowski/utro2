package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.user.User;

import java.util.HashSet;

public class TherapistRequestMapper {

    public static Therapist fromCreateRequest(TherapistProto.CreateTherapistRequest request, User user, Organisation organisation) {
        Therapist therapist = new Therapist();
        therapist.setUser(user);
        therapist.setOrganisation(organisation);
        therapist.setProfessionalTitle(request.getProfessionalTitle());
        therapist.setDescriptionEng(request.getDescriptionEng());
        therapist.setDescriptionPl(request.getDescriptionPl());
        therapist.setWorkExperienceEng(request.getWorkExperienceEng());
        therapist.setWorkExperiencePl(request.getWorkExperiencePl());
        therapist.setLanguages(new HashSet<>(request.getLanguagesList()));
        therapist.setInPersonTherapyFormat(request.getInPersonTherapyFormat());
        therapist.setOnlineTherapyFormat(request.getOnlineTherapyFormat());
        therapist.setContactEmail(request.getContactEmail());
        therapist.setContactPhone(request.getContactPhone());
        therapist.setWebsiteUrl(request.getWebsiteUrl());
        therapist.setIsAcceptingNewClients(request.getIsAcceptingNewClients());
        therapist.setVisibility(TherapistMapper.mapVisibilityFromProto(request.getVisibility()));
        therapist.setSlug(request.getSlug());
        therapist.setMetaDescription(request.getMetaDescription());
        therapist.setSearchTags(new HashSet<>(request.getSearchTagsList()));
        therapist.setIsActive(true);
        
        // Handle profile image if provided
        if (!request.getProfileImageData().isEmpty()) {
            therapist.setProfileImage(request.getProfileImageData().toByteArray());
            therapist.setProfileImageMimeType(request.getProfileImageMimeType());
        }
        
        return therapist;
    }

    public static void updateFromRequest(Therapist therapist, TherapistProto.UpdateTherapistRequest request) {
        if (request.hasProfessionalTitle()) {
            therapist.setProfessionalTitle(request.getProfessionalTitle());
        }
        if (request.hasDescriptionEng()) {
            therapist.setDescriptionEng(request.getDescriptionEng());
        }
        if (request.hasDescriptionPl()) {
            therapist.setDescriptionPl(request.getDescriptionPl());
        }
        if (request.hasWorkExperienceEng()) {
            therapist.setWorkExperienceEng(request.getWorkExperienceEng());
        }
        if (request.hasWorkExperiencePl()) {
            therapist.setWorkExperiencePl(request.getWorkExperiencePl());
        }
        if (!request.getLanguagesList().isEmpty()) {
            therapist.setLanguages(new HashSet<>(request.getLanguagesList()));
        }
        if (request.hasInPersonTherapyFormat()) {
            therapist.setInPersonTherapyFormat(request.getInPersonTherapyFormat());
        }
        if (request.hasOnlineTherapyFormat()) {
            therapist.setOnlineTherapyFormat(request.getOnlineTherapyFormat());
        }
        if (request.hasContactEmail()) {
            therapist.setContactEmail(request.getContactEmail());
        }
        if (request.hasContactPhone()) {
            therapist.setContactPhone(request.getContactPhone());
        }
        if (request.hasWebsiteUrl()) {
            therapist.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.hasIsAcceptingNewClients()) {
            therapist.setIsAcceptingNewClients(request.getIsAcceptingNewClients());
        }
        if (request.hasVisibility()) {
            therapist.setVisibility(TherapistMapper.mapVisibilityFromProto(request.getVisibility()));
        }
        if (request.hasSlug()) {
            therapist.setSlug(request.getSlug());
        }
        if (request.hasMetaDescription()) {
            therapist.setMetaDescription(request.getMetaDescription());
        }
        if (!request.getSearchTagsList().isEmpty()) {
            therapist.setSearchTags(new HashSet<>(request.getSearchTagsList()));
        }
        if (request.hasProfileImageData() && !request.getProfileImageData().isEmpty()) {
            therapist.setProfileImage(request.getProfileImageData().toByteArray());
            therapist.setProfileImageMimeType(request.getProfileImageMimeType());
        }
    }
}