package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.gen.organisation.v1.InvitationOuterClass;
import com.inspirationparticle.utro.gen.organisation.v1.OrganisationOuterClass;
import com.inspirationparticle.utro.time.TimeMapper;

public class InvitationMapper {
    
    public static InvitationOuterClass.Invitation toProto(Invitation invitation) {
        InvitationOuterClass.Invitation.Builder builder = InvitationOuterClass.Invitation.newBuilder()
                .setId(invitation.getId().toString())
                .setEmail(invitation.getEmail())
                .setOrganisationId(invitation.getOrganisation().getId().toString())
                .setMemberType(mapMemberType(invitation.getMemberType()))
                .setStatus(mapStatus(invitation.getStatus()))
                .setCreatedAt(TimeMapper.timestampFromInstant(invitation.getCreatedAt()))
                .setExpiresAt(TimeMapper.timestampFromInstant(invitation.getExpiresAt()));
                
        if (invitation.getInvitedBy() != null) {
            builder.setInvitedBy(OrganisationMapper.userProtoFromUser(invitation.getInvitedBy()));
        }
        
        return builder.build();
    }
    
    private static OrganisationOuterClass.MemberType mapMemberType(MemberType memberType) {
        return memberType == MemberType.ADMINISTRATOR 
                ? OrganisationOuterClass.MemberType.MEMBER_TYPE_ADMINISTRATOR 
                : OrganisationOuterClass.MemberType.MEMBER_TYPE_MEMBER;
    }
    
    private static InvitationOuterClass.InvitationStatus mapStatus(Invitation.InvitationStatus status) {
        switch (status) {
            case PENDING: return InvitationOuterClass.InvitationStatus.PENDING;
            case ACCEPTED: return InvitationOuterClass.InvitationStatus.ACCEPTED;
            case DECLINED: return InvitationOuterClass.InvitationStatus.DECLINED;
            case EXPIRED: return InvitationOuterClass.InvitationStatus.EXPIRED;
            default: return InvitationOuterClass.InvitationStatus.INVITATION_STATUS_UNSPECIFIED;
        }
    }
}
