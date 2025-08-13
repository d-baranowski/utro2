package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;

public class MemberTypeMapper {
    public static OrganisationOuterClass.MemberType protoFromEntity(MemberType memberType) {
        switch (memberType) {
            case ADMINISTRATOR -> {
                return OrganisationOuterClass.MemberType.MEMBER_TYPE_ADMINISTRATOR;
            }
            case MEMBER -> {
                return OrganisationOuterClass.MemberType.MEMBER_TYPE_MEMBER;
            }
        }

        return OrganisationOuterClass.MemberType.MEMBER_TYPE_UNSPECIFIED;
    }
}
