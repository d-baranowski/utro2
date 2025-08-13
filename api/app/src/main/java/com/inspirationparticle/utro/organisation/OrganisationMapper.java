package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;
import com.inspirationparticle.utro.time.TimeMapper;

public class OrganisationMapper {
    public static OrganisationOuterClass.Organisation protoFromEntity(Organisation e, MemberType mt) {
        return OrganisationOuterClass.Organisation.newBuilder()
                .setId(e.getId())
                .setName(e.getName())
                .setDescription(e.getDescription())
                .setCreatedAt(TimeMapper.timestampFromInstant(e.getCreatedAt()))
                .setUpdatedAt(TimeMapper.timestampFromInstant(e.getUpdatedAt()))
                .setMemberType(MemberTypeMapper.protoFromEntity(mt)).build();
    }

    public static Organisation entityFromCreateRequest(OrganisationOuterClass.CreateOrganisationRequest request) {
        return Organisation.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }
}
