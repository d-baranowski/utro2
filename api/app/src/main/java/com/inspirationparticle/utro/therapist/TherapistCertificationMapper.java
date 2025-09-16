package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto;
import com.inspirationparticle.utro.time.TimeMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class TherapistCertificationMapper {

    public static TherapistProto.TherapistCertification toProto(TherapistCertification certification) {
        if (certification == null) {
            return null;
        }

        TherapistProto.TherapistCertification.Builder builder = TherapistProto.TherapistCertification.newBuilder()
            .setId(certification.getId().toString())
            .setName(certification.getName())
            .setIssuingOrganization(certification.getIssuingOrganization())
            .setIsActive(certification.getIsActive() != null ? certification.getIsActive() : false)
            .setDisplayOrder(certification.getDisplayOrder() != null ? certification.getDisplayOrder() : 0)
            .setCreatedAt(TimeMapper.timestampFromInstant(certification.getCreatedAt()))
            .setUpdatedAt(TimeMapper.timestampFromInstant(certification.getUpdatedAt()));

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
}