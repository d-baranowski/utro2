package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto;
import com.inspirationparticle.utro.time.TimeMapper;

public class TherapistEducationMapper {

    public static TherapistProto.TherapistEducation toProto(TherapistEducation education) {
        if (education == null) {
            return null;
        }

        TherapistProto.TherapistEducation.Builder builder = TherapistProto.TherapistEducation.newBuilder()
            .setId(education.getId().toString())
            .setDegree(education.getDegree())
            .setInstitution(education.getInstitution())
            .setIsCompleted(education.getIsCompleted() != null ? education.getIsCompleted() : false)
            .setDisplayOrder(education.getDisplayOrder() != null ? education.getDisplayOrder() : 0)
            .setCreatedAt(TimeMapper.timestampFromInstant(education.getCreatedAt()))
            .setUpdatedAt(TimeMapper.timestampFromInstant(education.getUpdatedAt()));

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
}