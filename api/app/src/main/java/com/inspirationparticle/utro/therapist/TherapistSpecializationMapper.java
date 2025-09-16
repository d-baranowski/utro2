package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.therapist.v1.TherapistProto;
import com.inspirationparticle.utro.time.TimeMapper;

public class TherapistSpecializationMapper {

    public static TherapistProto.TherapistSpecialization toProto(TherapistSpecialization ts) {
        if (ts == null) {
            return null;
        }

        Specialization spec = ts.getSpecialization();
        
        TherapistProto.TherapistSpecialization.Builder builder = TherapistProto.TherapistSpecialization.newBuilder()
            .setSpecializationId(spec.getId().toString())
            .setNameEng(spec.getNameEng())
            .setNamePl(spec.getNamePl())
            .setIsPrimary(ts.getIsPrimary() != null ? ts.getIsPrimary() : false)
            .setCreatedAt(TimeMapper.timestampFromInstant(ts.getCreatedAt()));

        if (spec.getDescriptionEng() != null) {
            builder.setDescriptionEng(spec.getDescriptionEng());
        }
        if (spec.getDescriptionPl() != null) {
            builder.setDescriptionPl(spec.getDescriptionPl());
        }
        if (spec.getCategory() != null) {
            builder.setCategory(spec.getCategory());
        }
        if (ts.getYearsOfPractice() != null) {
            builder.setYearsOfPractice(ts.getYearsOfPractice());
        }

        return builder.build();
    }
}