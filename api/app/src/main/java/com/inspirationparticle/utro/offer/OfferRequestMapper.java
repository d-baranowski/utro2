package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.v1.OfferProto;
import com.inspirationparticle.utro.organisation.Organisation;

import java.time.Instant;
import java.util.UUID;

public class OfferRequestMapper {

    public static Offer fromCreateRequest(OfferProto.CreateOfferRequest request, Organisation organisation) {
        Offer offer = new Offer();
        offer.setId(UUID.randomUUID());
        offer.setOrganisation(organisation);
        offer.setNameEng(request.getNameEng());
        offer.setNamePl(request.getNamePl());
        offer.setDescriptionEng(request.getDescriptionEng());
        offer.setDescriptionPl(request.getDescriptionPl());
        offer.setCreatedAt(Instant.now());
        offer.setUpdatedAt(Instant.now());
        
        // Handle profile image if provided
        if (!request.getProfileImageData().isEmpty()) {
            offer.setProfileImage(request.getProfileImageData().toByteArray());
            offer.setProfileImageMimeType(request.getProfileImageMimeType());
        }
        
        return offer;
    }

    public static void updateFromRequest(Offer offer, OfferProto.UpdateOfferRequest request) {
        if (request.hasNameEng()) {
            offer.setNameEng(request.getNameEng());
        }
        if (request.hasNamePl()) {
            offer.setNamePl(request.getNamePl());
        }
        if (request.hasDescriptionEng()) {
            offer.setDescriptionEng(request.getDescriptionEng());
        }
        if (request.hasDescriptionPl()) {
            offer.setDescriptionPl(request.getDescriptionPl());
        }
        if (request.hasProfileImageData() && !request.getProfileImageData().isEmpty()) {
            offer.setProfileImage(request.getProfileImageData().toByteArray());
            offer.setProfileImageMimeType(request.getProfileImageMimeType());
        }
        
        offer.setUpdatedAt(Instant.now());
    }
}