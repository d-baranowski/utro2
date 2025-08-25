package com.inspirationparticle.utro.therapist.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TherapistSpecializationDto {
    private UUID specializationId;
    private String nameEng;
    private String namePl;
    private String descriptionEng;
    private String descriptionPl;
    private String category;
    private Boolean isPrimary;
    private Integer yearsOfPractice;
    private Instant createdAt;
}