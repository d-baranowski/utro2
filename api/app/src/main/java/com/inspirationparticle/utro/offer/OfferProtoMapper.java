package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.offer.v1.OfferProto;
import com.inspirationparticle.utro.time.TimeMapper;

public class OfferProtoMapper {

    public static OfferProto.Offer toProto(Offer offer) {
        if (offer == null) {
            return null;
        }

        OfferProto.Offer.Builder builder = OfferProto.Offer.newBuilder()
            .setId(offer.getId().toString())
            .setOrganisationId(offer.getOrganisation().getId().toString())
            .setOrganisationName(offer.getOrganisation().getName())
            .setCreatedAt(TimeMapper.timestampFromInstant(offer.getCreatedAt()))
            .setUpdatedAt(TimeMapper.timestampFromInstant(offer.getUpdatedAt()));

        // Optional string fields
        if (offer.getNameEng() != null) {
            builder.setNameEng(offer.getNameEng());
        }
        if (offer.getNamePl() != null) {
            builder.setNamePl(offer.getNamePl());
        }
        if (offer.getDescriptionEng() != null) {
            builder.setDescriptionEng(offer.getDescriptionEng());
        }
        if (offer.getDescriptionPl() != null) {
            builder.setDescriptionPl(offer.getDescriptionPl());
        }
        if (offer.getProfileImageMimeType() != null) {
            builder.setProfileImageMimeType(offer.getProfileImageMimeType());
        }

        return builder.build();
    }
}