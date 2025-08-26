package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;
import com.inspirationparticle.utro.time.TimeMapper;

public class OrganisationMapper {
    public static OrganisationOuterClass.Organisation protoFromEntity(Organisation e, MemberType mt) {
        return OrganisationOuterClass.Organisation.newBuilder()
                .setId(e.getId().toString())
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

    public static OrganisationOuterClass.User userProtoFromMember(OrganisationMember member) {
        return OrganisationOuterClass.User.newBuilder()
                .setId(member.getUser().getId().toString())
                .setUsername(member.getUser().getUsername())
                .setFullName(member.getUser().getFullName() != null ? member.getUser().getFullName() : "")
                .setEmail(member.getUser().getEmail() != null ? member.getUser().getEmail() : "")
                .setMemberType(MemberTypeMapper.protoFromEntity(member.getMemberType()))
                .setJoinedAt(TimeMapper.timestampFromInstant(member.getJoinedAt()))
                .setCreatedAt(TimeMapper.timestampFromInstant(member.getUser().getCreatedAt()))
                .setUpdatedAt(TimeMapper.timestampFromInstant(member.getUser().getUpdatedAt()))
                .build();
    }
}
